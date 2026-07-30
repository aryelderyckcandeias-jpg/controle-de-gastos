
  function onChangeEmail() {
    toggleEmailErrors();
    toggleButtonsErrors();
}

function onChangePassword() {
    togglePasswordErrors();
    toggleButtonsErrors();
}

/*
 * Envia e-mail e senha para o backend.
 */
async function login(event) {
    event.preventDefault();

    const email = form.email().value;
    const password = form.password().value;

    const loginButton =
        form.loginButton();

    const messageElement =
        form.loginMessage();

    loginButton.disabled = true;

    messageElement.textContent =
        "Realizando login...";

    messageElement.className =
        "login-message loading";

    try {
        const response = await fetch(
            "/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials: "same-origin",

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Não foi possível realizar o login."
            );
        }

        messageElement.textContent =
            result.message;

        messageElement.className =
            "login-message success";

        window.location.href =
            "/pages/home/home.html";
    } catch (error) {
        console.error(error);

        messageElement.textContent =
            error.message;

        messageElement.className =
            "login-message error";
    } finally {
        toggleButtonsErrors();
    }
}

function register() {
    window.location.href =
        "/pages/register/register.html";
}

function isEmailValid() {
    const email = form.email().value;

    if (!email) {
        return false;
    }

    return validateEmail(email);
}

function isPasswordValid() {
    const password = form.password().value;

    return Boolean(password);
}

function toggleEmailErrors() {
    const email = form.email().value;

    form.emailRequiredError().style.display =
        email ? "none" : "block";

    form.emailInvalidError().style.display =
        email && !validateEmail(email)
            ? "block"
            : "none";
}

function togglePasswordErrors() {
    const password = form.password().value;

    form.passwordRequiredError().style.display =
        password ? "none" : "block";
}

function toggleButtonsErrors() {
    const emailValid = isEmailValid();
    const passwordValid = isPasswordValid();

    form.recoverPasswordButton().disabled =
        !emailValid;

    form.loginButton().disabled =
        !emailValid || !passwordValid;
}

const form = {
    email: () =>
        document.getElementById("email"),

    emailInvalidError: () =>
        document.getElementById(
            "email-invalid-error"
        ),

    emailRequiredError: () =>
        document.getElementById(
            "email-required-error"
        ),

    loginButton: () =>
        document.getElementById(
            "login-button"
        ),

    loginMessage: () =>
        document.getElementById(
            "login-message"
        ),

    password: () =>
        document.getElementById("password"),

    passwordRequiredError: () =>
        document.getElementById(
            "password-required-error"
        ),

    recoverPasswordButton: () =>
        document.getElementById(
            "recover-password-button"
        )
};