import multiprocessing
import Queue
import urllib2
from json import loads
from operator import add
from sys import stderr
from time import sleep


class HashCollectorDaemon(multiprocessing.Process):
    def __init__(self, url, queue, spare_queue, sysrandom):
        super(HashCollectorDaemon, self).__init__()
        self.most_recent = 0
        self._url = url
        self._queue = queue
        self._spare_queue = spare_queue
        self._sysrandom = sysrandom

    def run(self):
        self.stream_entropy()

    def get_unconfirmed_transactions(self):
        """
        Fetches the list of unconfirmed transactions from blockchain.info.
        """
        response = urllib2.urlopen(self._url)
        if response.code == 200:
            return loads(response.read())['txs']
        else:
            raise urllib2.HTTPError("Status code: %s" % response.status_code)

    def fill_queue(self, trans):
        """
        Fill the main queue and spare queue with entropy from recent
        transactions.
        """
        most_recent_trans = max((t['time'] for t in trans))         #最新的交易的时间
        if most_recent_trans > self.most_recent:                    #如果有最新的才进行下一步操作
            self.most_recent = most_recent_trans
            trans = filter(lambda x: x > most_recent_trans, trans)  #对trans序列的每个成员x，执行前面的lambda函数，结果为true组成新的序列
            hex_hashes = reduce(add, (t['hash'] for t in trans))
            bytes = bytearray.fromhex(hex_hashes)

            for byte in bytes[::-1]:
                try:
                    self._queue.put_nowait(byte)
                except Queue.Full:
                    pass
                try:
                    self._spare_queue.put_nowait(byte)
                except Queue.Full:
                    pass

    def stream_entropy(self):
        """
        Stream new entropy from blockchain.info.
        """
        transactions = []
        tries = 8
        while True:
            try:
                """
                从接口获取未确认的交易txs
                """
                transactions = self.get_unconfirmed_transactions()
                tries = 8
            except (urllib2.HTTPError, urllib2.URLError):
                tries -= 1
                if tries <= 0:
                    stderr.write("WARNING: Cannot connect to blockchain.info")
            except Exception as e:
                self.terminate()
                raise e
            if len(transactions) > 0:
                """
                将未确认的交易txs放到对列里面
                """
                self.fill_queue(transactions)
            sleep(10)   # 每10s执行一次

    def _use_cpu_entropy(self):
        """
        If we were never able to connect to blockchain.info, and thus have no
        entropy in the spare cache, lean on Python's random.SystemRandom to get
        some entropy.
        """
        try:
            for byte in (self._sysrandom.randint(0, 256) for i in range(8)):
                self._spare_queue.put_nowait(byte)
        except Queue.Full:
            pass
