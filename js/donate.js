// -- Logging ------------------------------------------------------------------

function onoes(s)
{
  $('#payment_status').removeClass('in'); // fade out if necessary
  $('#payment_status').removeClass('alert-success').addClass('alert-error');
  $('#status_message').html("<small>" + s + "</small>");
  $('#payment_status').addClass('in');
  return null;
}

function ogood(s)
{
  $('#payment_status').removeClass('in'); // fade out if necessary
  $('#payment_status').removeClass('alert-error').addClass('alert-success');
  $('#status_message').html("<small>" + s + "</small>");
  $('#payment_status').addClass('in');
  return null;
}

// hide alert when button is clicked
$(function() {
  $('#pay_status_close_btn').click(function () {
    $('#payment_status').removeClass('in');
  });
});

// -- Dealing with $$$ ---------------------------------------------------------

function disableDonateButton()
{
  $('#paybtn').addClass('disabled');
  $('#paybtn').html("<i class=\"icon-refresh icon-spin\"></i> Working...");
}

function enableDonateButton()
{
  $('#paybtn').html('Donate');
  $('#paybtn').removeClass('disabled');
}

function validateAmnt()
{
  var amnt = $.trim($('#monies').val());
  if (amnt.length == 0) return onoes("You must enter a valid amount of money.");

  var match = /^(\d*)(?:\.(\d{1,2}))?$/.exec(amnt);
  if (!match) return onoes("Invalid amount: " + amnt);

  // Normalize input. If there's no leading zero before the decimal,
  // then there's no dollars. If you put in '23.3' you want 2330, not
  // 2303.
  var r1 = match[1]; var r2 = match[2];
  if (r1 == null || r1.length == 0) r1 = "0";
  if (r2 != null && r2.length == 1) r2 += "0";

  var dolla = parseInt(r1, 10),
      cents = parseInt(r2 || "0", 10);
      total = (dolla * 100) + cents;
  if (total < 50) return onoes("Minimum charge is 50 cents!");
  return total;
}

function chargeCard(token)
{
  var amnt = 2500;//validateAmnt();
  if (amnt == null) return;
  disableDonateButton();

  var params = {};
  params.amount = amnt;
  params.token  = token.id;
  params.email  = token.email;

  $.post('https://donate-moment.herokuapp.com/charge', params,
    // Success
    function () {
      var date = new Date();
      ogood("<strong>" + date.toUTCString() + "</strong>: "
            + "Successfully charged -- Thank you!");
      enableDonateButton();
    }).fail(
    // Failure
    function(xhr, status) {
      var err;
      try {
        err = JSON.parse(xhr.responseText).message;
      } catch (x) {
        err = "Unknown error. :(";
      }
      onoes("<strong>Payment failed</strong>. Reason: <em>" + err + "</em>");
      enableDonateButton();
    });
}


// -- Entry point --------------------------------------------------------------

var stripeHandler = StripeCheckout.configure({
  key:             stripe_pubkey,
  name:            'Pay Now',
  description:     "Because you're awesome",
  panelLabel:      'Donate {{amount}}',
  currency:        'usd',
  allowRememberMe: false,
  bitcoin:         true,
  token:           chargeCard,
});

// Close Checkout on page navigation
$(function() {
  $(window).on('popstate', function() {
    stripeHandler.close();
  });
});

$(function() {
  $('#paybtn').click(function (e) {
    var amnt = 2500;//validateAmnt();
    if (amnt == null) return;

    stripeHandler.open({
      amount:      amnt,
    });
    e.preventDefault();
  });
});

// Local Variables:
// fill-column: 80
// indent-tabs-mode: nil
// js-indent-level: 2
// buffer-file-coding-system: utf-8-unix
// End:
