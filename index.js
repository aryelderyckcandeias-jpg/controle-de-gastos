
    function onChangeEmail() {
        toggleEmailErrors();
        toggleButtonsErrors();
    }

        function onChangePassword() {
        togglePasswordErrors();
        toggleButtonsErrors();
    }

    function isEmailValid(){
        const email = document.getElementById("email").value;
        if (!email){
            return false;
        }
        return validateEmail(email);
    }

    function toggleEmailErrors() {
        const email = document.getElementById("email").value;
        if (!email){
            document.getElementById('email-required-error').style.display = 'block';
        } else {
            document.getElementById('email-required-error').style.display = 'none';
        }
         if (email && !validateEmail(email)){
            document.getElementById('email-invalid-error').style.display = 'block';
        } else {
            document.getElementById('email-invalid-error').style.display = 'none';
            }
    }

    function togglePasswordErrors() {
        const password = document.getElementById("password").value;
        if (!password){
            document.getElementById('password-required-error').style.display = 'block';
        } else {
            document.getElementById('password-required-error').style.display = 'none';
        }
    }

    function toggleButtonsErrors() {
        const emailValid = isEmailValid();
         document.getElementById('recover-password-button').disabled = !emailValid;

         const password = isPasswordValid();
        document.getElementById('login-button').disabled = !emailValid || !password;

    }


    function isPasswordValid(){
        const password = document.getElementById("password").value;
        if (!password){
            return false;
        }
        return true;
    }

    function validateEmail(email){
        return /\S+@\S+\.\S+/.test(email);
    }