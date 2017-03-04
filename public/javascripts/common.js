var TICKET_LENGTH = 16;
var MAX_WINNERS = 3;
$(document).ready(function(){
  // When form submitted, encode data and redirect
  $("#create-raffle").submit(function( event ) {
    event.preventDefault();

    var data = encodeData($("#block").val(), $("#level").val(), $("#winners").val(), $("#mantotal").val());
    window.location.href = "?data=" + data;
  });

  var urlParams = getUrlParams();

  if (urlParams.simple) {
    alert("simple");
    $("#tickets-bought").addClass("simplified");
  }

  var data = decodeData(urlParams);

  var block = Number(data.block);
  var level = Number(data.level);
  var maxWinners = Number(data.winners);
  maxWinners = isNaN(maxWinners) ? 1 : maxWinners;
  var mantotal = Number(data.mantotal);

  if (block !== undefined && !isNaN(block) && block >= 0 &&
      level !== undefined && !isNaN(level) && level >= 0) {

    $("#raffle").removeClass("hidden");
    $(".target-block").text(block);
      $("#block").val(block);
      $("#level").val(level);
      $("#winners").val(maxWinners);
      $("#mantotal").val(mantotal);

    runLoot(block, level, maxWinners, mantotal);
  }
});

function decodeData(urlParams) {
  var utf8String = sjcl.codec.utf8String;
  var base64 = sjcl.codec.base64;

  try{
    return JSON.parse(utf8String.fromBits(base64.toBits(urlParams.data)))
  }catch(e){
    // Don't care for error
    return urlParams;
  }
}

function encodeData(block, level, winners, mantotal) {
  var utf8String = sjcl.codec.utf8String;
  var base64 = sjcl.codec.base64;

  var data = {block: block, level: level, winners: winners, mantotal: mantotal};
  return base64.fromBits(utf8String.toBits(JSON.stringify(data)));
}

function showWinner(result) {
  $(".winner-found").removeClass("hidden");
  $(".calculating-winner").addClass("hidden");
  $(".winning-tx").text(result);
  $("#create-raffle").removeClass("hidden");
}




function showError(message) {
  $("#spinner").addClass("hidden");
  $("#winner").addClass("hidden");
  $("#error-box").removeClass("hidden");
  $("#error-box p").text(message);
}



function runLoot(block, level, maxWinners, mantotal) {
  bitloot.run(block, level, maxWinners, mantotal, function(err, result) {
    if (err) {
      showError(err);
        console.error(err);
      $("#create-raffle").removeClass("hidden");
      return;
    }
    else if (err === "") {
      showError("An unknown error occurred");
        console.error("An unknown error occurred");
      return;
    }


    if (result !== undefined && result) {
      // var winner = result.winners[0];
        result = level + "等奖 " + result;
        showWinner(result);
        console.log("Winner transaction is: " + winner.tx.hash + " with ticket " + winner.ticket);
      // showFollowups(result.winners);
    }
    else {
        console.log("Not a winner yet");
      showWinner("none", "none");
    }
  }, function(latestBlock) {
    if (latestBlock.height < block) {
      var blocksLeft = block - latestBlock.height;
      $(".blocks-left").text(blocksLeft);
    }
    else {
      $("#spinner").addClass("hidden");
      $("#winner").removeClass("hidden");
      $(".blocks-left").text(0);
    }

  }, function(newTxs) {
    var tableRows = [];
    var totalAmount = Number($(".amount-in-raffle").text());
    if (isNaN(totalAmount)) { totalAmount = 0; }
    totalAmount = Math.round(totalAmount * 1e8);

    for (var i = 0; i < newTxs.length; i++) {
      var tx = newTxs[i];
      var row =
          "<tr><td>"+tx.hash+"</td>" +
              "<td><i class='fa fa-btc'></i> "+tx.value/1e8+"</td>" +
              "<td>"+tx.totalTickets+"</td></tr>";
      tableRows.push(row);
      totalAmount += tx.value;

      // Show tickets
      if (tx.tickets.length > 0) {
        var rowspan = " rowspan='" + (tx.tickets.length + 1) + "'";

        tableRows.push("<tr><td"+rowspan+">Tickets</td><td"+rowspan+"></td></tr>");

        for (var j = 0; j < tx.tickets.length; j++) {
          var ticketShort = "<span class='ticket'>" + tx.tickets[j].substr(0, TICKET_LENGTH) + "</span>";
          var ticketRow = "<tr><td>"+ticketShort+"</td></tr>";
          tableRows.push(ticketRow);
        }
      }
    }
    $(".amount-in-raffle").text(totalAmount / 1e8);
    // Show table if there are transactions
    if (newTxs.length > 0) {
      $("#tickets-bought").removeClass("hidden");
      $("#result-table > tbody:last").append(tableRows.join(""));
    }
  });
}


function getUrlParams() {
  "use strict";
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);

  var urlParams = {};
  match = search.exec(query);
  while (match) {
    var name = decode(match[1]), value = decode(match[2]);

    if (urlParams[name] === undefined) {
      urlParams[name] = value;
    }
    else {
      if (!$.isArray(urlParams[name])) {
        urlParams[name] = [urlParams[name]];
      }
      urlParams[name].push(value);
    }
    match = search.exec(query);
  }
  return urlParams;
}
