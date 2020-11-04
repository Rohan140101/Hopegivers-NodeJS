<!DOCTYPE html>
<html>

<head>
  <title>HopeGivers</title>
  <link rel="stylesheet" type="text/css" href="css/register.css">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.14.0/css/all.css">
</head>

<body>

  <!-- multistep form -->
  <form action="/register" method="POST" id="multistepsform">
    <!-- progressbar -->
    <ul id="progressbar">
      <li class="active">Account Setup</li>
      <li>Personal Details</li>
      <li>Social Profiles</li>
    </ul>

    <!-- fieldsets -->
    <fieldset>
      <h2 class="fs-title">Create your account</h2>
      <h3 class="fs-subtitle"></h3>
      <input type="text" name="email" placeholder="Email" />
      <span id="password-span">
        <input type="password" id="password" name="password" placeholder="Password" />
        <i id="hide-password" class="far fa-eye-slash toggle-password"></i>
        <i id="show-password" class="far fa-eye toggle-password"></i>
      </span>
      <input type="password" id="confirm_password" name="confirm_password" placeholder="Confirm Password" />
      <p style="display: none; color:crimson;" class="alertMsg">
        <i class="fas fa-exclamation-circle"></i>
        <span>Entered Passwords must be same </span>
      </p>
      <input type="button" name="next" id="nextButton" class="next action-button" value="Next" />
    </fieldset>

    <fieldset>
      <h2 class="fs-title">Personal Details</h2>
      <h3 class="fs-subtitle">We will never sell it</h3>
      <input type="text" id="fname" name="first_name" placeholder="First Name" />
      <input type="text" id="lname" name="last_name" placeholder="Last Name" />
      <input type="text" name="phone" placeholder="Phone" />
      <input type="date" name="dob" placeholder="DOB" />
      <textarea name="address" placeholder="Address"></textarea>
      <input type="button" name="previous" class="previous action-button" value="Previous" />

      <input type="button" name="next" class="next action-button" value="Next" />
    </fieldset>
    <fieldset>
      <h2 class="fs-title">Social Profiles</h2>
      <h3 class="fs-subtitle">Your presence on the social network</h3>
      <input type="text" name="twitter" placeholder="Twitter" />
      <input type="text" name="facebook" placeholder="Facebook" />
      <input type="text" name="gplus" placeholder="Google Plus" />
      <input type="button" name="previous" class="previous action-button" value="Previous" />
      <input type="submit" name="submit" class="submit action-button" value="Submit" />
    </fieldset>

    <p class="member-login">
      Already a member? <a href="login">Sign in</a>
    </p>
  </form>

  <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>

  <script>

    let current_field, next_field, prev_field, password, confirm_password;

    password = document.getElementById("password");
    confirm_password = document.getElementById("confirm_password");

    $('.toggle-password').on('click', function (e) {
      if (password.type === 'password') {
        console.log('Password type is text');
        password.type = 'text';
        confirm_password.type = 'text';
        $('#hide-password').hide();
        $('#show-password').show();
      }
      else {
        password.type = 'password';
        confirm_password.type = 'password';
        $('#hide-password').show();
        $('#show-password').hide();
      }
    });

    $('.next').on('click', function () {
      if (password.value != confirm_password.value) {
        console.log('password do not match');
        $('.alertMsg').show();
      }
      else {
        $('.alertMsg').hide();
        current_field = $(this).parent();
        next_field = $(this).parent().next();
        console.log(current_field);
        console.log(next_field);

        $('#progressbar li').eq($('fieldset').index(next_field)).addClass('active');
        next_field.show().addClass('next-animation');
        current_field.hide();

      }
    });

    $('.previous').on('click', function (e) {
      current_field = $(this).parent();
      prev_field = $(this).parent().prev();
      // console.log(current_field);
      // console.log(prev_field);

      $('#progressbar li').eq($('fieldset').index(current_field)).removeClass('active');
      prev_field.show();
      current_field.hide();

    });


  </script>
</body>

</html>