
    function onChangeEmail() {
        toggleEmailErrors();
        toggleButtonsErrors();
    }

        function onChangePassword() {
        togglePasswordErrors();
        toggleButtonsErrors();
    }

    function isEmailValid(){
        const email = form.email().value;
        if (!email){
            return false;
        }
        return validateEmail(email);
    }

    function toggleEmailErrors() {
        const email = form.email().value;
        form.emailRequiredError().style.display = email ? "none" : "block";
        
        form.emailInvalidError().style.display = validateEmail(email) ? "none" : "block";
         
    }

    function togglePasswordErrors() {
        const password = form.password().value;

        form.passwordRequiredError().style.display = password ? "none": "block";
        
    }

    function toggleButtonsErrors() {
        const emailValid = isEmailValid();
         form.recoverPasswordButton().disabled = !emailValid;

         const password = isPasswordValid();
        form.loginButton().disabled = !emailValid || !password;

    }


    function isPasswordValid(){
        const password = form.password().value;
        if (!password){
            return false;
        }
        return true;
    }

 
    const form = {
        email:()=> document.getElementById("email"),
        emailInvalidError:()=> document.getElementById("email-invalid-error"),
        emailRequiredError:()=> document.getElementById("email-required-error"),
        loginButton:()=> document.getElementById("login-button"),
        password:()=> document.getElementById("password"),
        passwordRequiredError:()=> document.getElementById("password-required-error"),
        recoverPasswordButton:()=> document.getElementById("recover-password-button") ,
    }