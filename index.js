/*
 * =====================================================
 * ELEMENTOS DA PÁGINA
 * =====================================================
 */

const elements = {
    form:
        document.getElementById("login-form"),

    email:
        document.getElementById("email"),

    emailGroup:
        document.getElementById("email-group"),

    emailRequiredError:
        document.getElementById(
            "email-required-error"
        ),

    emailInvalidError:
        document.getElementById(
            "email-invalid-error"
        ),

    password:
        document.getElementById("password"),

    passwordGroup:
        document.getElementById(
            "password-group"
        ),

    passwordRequiredError:
        document.getElementById(
            "password-required-error"
        ),

    passwordInvalidError:
        document.getElementById(
            "password-invalid-error"
        ),

    togglePasswordButton:
        document.getElementById(
            "toggle-password-button"
        ),

    recoverPasswordButton:
        document.getElementById(
            "recover-password-button"
        ),

    loginButton:
        document.getElementById(
            "login-button"
        ),

    registerButton:
        document.getElementById(
            "register-button"
        ),

    loginMessage:
        document.getElementById(
            "login-message"
        )
};

/*
 * Estado local do formulário.
 */
const state = {
    emailTouched: false,
    passwordTouched: false,
    submitting: false
};

/*
 * =====================================================
 * VALIDAÇÕES
 * =====================================================
 */

function getEmailError() {
    const email =
        elements.email.value.trim();

    if (!email) {
        return "required";
    }

    if (!validateEmail(email)) {
        return "invalid";
    }

    return null;
}

function getPasswordError() {
    const password =
        elements.password.value;

    if (!password) {
        return "required";
    }

    if (password.length < 6) {
        return "invalid";
    }

    return null;
}

function renderEmailValidation() {
    const error = getEmailError();

    const shouldShow =
        state.emailTouched;

    elements.emailRequiredError.hidden =
        !(
            shouldShow &&
            error === "required"
        );

    elements.emailInvalidError.hidden =
        !(
            shouldShow &&
            error === "invalid"
        );

    elements.emailGroup.classList.toggle(
        "has-error",
        shouldShow && Boolean(error)
    );

    elements.emailGroup.classList.toggle(
        "is-valid",
        shouldShow && !error
    );

    elements.email.setAttribute(
        "aria-invalid",
        String(
            shouldShow &&
            Boolean(error)
        )
    );
}

function renderPasswordValidation() {
    const error = getPasswordError();

    const shouldShow =
        state.passwordTouched;

    elements.passwordRequiredError.hidden =
        !(
            shouldShow &&
            error === "required"
        );

    elements.passwordInvalidError.hidden =
        !(
            shouldShow &&
            error === "invalid"
        );

    elements.passwordGroup.classList.toggle(
        "has-error",
        shouldShow && Boolean(error)
    );

    elements.passwordGroup.classList.toggle(
        "is-valid",
        shouldShow && !error
    );

    elements.password.setAttribute(
        "aria-invalid",
        String(
            shouldShow &&
            Boolean(error)
        )
    );
}

function isFormValid() {
    return (
        !getEmailError() &&
        !getPasswordError()
    );
}

function updateButtons() {
    const emailValid =
        !getEmailError();

    elements.recoverPasswordButton.disabled =
        !emailValid ||
        state.submitting;

    elements.loginButton.disabled =
        !isFormValid() ||
        state.submitting;
}

/*
 * =====================================================
 * MENSAGENS
 * =====================================================
 */

function showFeedback(message, type) {
    elements.loginMessage.textContent =
        message;

    elements.loginMessage.className =
        `feedback feedback-${type}`;

    elements.loginMessage.hidden = false;
}

function hideFeedback() {
    elements.loginMessage.hidden = true;
    elements.loginMessage.textContent = "";
    elements.loginMessage.className =
        "feedback";
}

/*
 * =====================================================
 * CARREGAMENTO
 * =====================================================
 */

function setSubmitting(submitting) {
    state.submitting = submitting;

    elements.loginButton.classList.toggle(
        "is-loading",
        submitting
    );

    elements.loginButton.setAttribute(
        "aria-busy",
        String(submitting)
    );

    updateButtons();
}

/*
 * =====================================================
 * LOGIN
 * =====================================================
 */

async function handleLogin(event) {
    event.preventDefault();

    state.emailTouched = true;
    state.passwordTouched = true;

    renderEmailValidation();
    renderPasswordValidation();
    updateButtons();

    if (!isFormValid()) {
        const firstInvalidField =
            getEmailError()
                ? elements.email
                : elements.password;

        firstInvalidField.focus();

        showFeedback(
            "Revise os campos destacados.",
            "error"
        );

        return;
    }

    setSubmitting(true);

    showFeedback(
        "Validando seus dados...",
        "loading"
    );

    let loginSucceeded = false;

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
                    email:
                        elements.email.value.trim(),

                    password:
                        elements.password.value
                })
            }
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Não foi possível entrar."
            );
        }

        loginSucceeded = true;

        showFeedback(
            "Login confirmado. Abrindo seu painel...",
            "success"
        );

        /*
         * Pequeno intervalo apenas para que o usuário
         * perceba a confirmação visual.
         */
        window.setTimeout(() => {
            window.location.href =
                "/pages/home/home.html";
        }, 350);
    } catch (error) {
        console.error(error);

        showFeedback(
            error.message,
            "error"
        );
    } finally {
        if (!loginSucceeded) {
            setSubmitting(false);
        }
    }
}

/*
 * =====================================================
 * EVENTOS DOS CAMPOS
 * =====================================================
 */

elements.email.addEventListener(
    "input",
    () => {
        if (state.emailTouched) {
            renderEmailValidation();
        }

        if (
            !elements.loginMessage.hidden
        ) {
            hideFeedback();
        }

        updateButtons();
    }
);

elements.email.addEventListener(
    "blur",
    () => {
        state.emailTouched = true;

        renderEmailValidation();
        updateButtons();
    }
);

elements.password.addEventListener(
    "input",
    () => {
        if (state.passwordTouched) {
            renderPasswordValidation();
        }

        if (
            !elements.loginMessage.hidden
        ) {
            hideFeedback();
        }

        updateButtons();
    }
);

elements.password.addEventListener(
    "blur",
    () => {
        state.passwordTouched = true;

        renderPasswordValidation();
        updateButtons();
    }
);

/*
 * Mostrar ou esconder a senha.
 */
elements.togglePasswordButton.addEventListener(
    "click",
    () => {
        const passwordIsVisible =
            elements.password.type === "text";

        elements.password.type =
            passwordIsVisible
                ? "password"
                : "text";

        elements.togglePasswordButton.textContent =
            passwordIsVisible
                ? "Mostrar"
                : "Ocultar";

        elements.togglePasswordButton.setAttribute(
            "aria-label",
            passwordIsVisible
                ? "Mostrar senha"
                : "Ocultar senha"
        );

        elements.togglePasswordButton.setAttribute(
            "aria-pressed",
            String(!passwordIsVisible)
        );

        elements.password.focus();
    }
);

/*
 * Recuperação de senha ainda será implementada.
 */
elements.recoverPasswordButton.addEventListener(
    "click",
    () => {
        showFeedback(
            "A recuperação de senha será adicionada em uma próxima etapa.",
            "info"
        );
    }
);

/*
 * Abre a tela de cadastro.
 */
elements.registerButton.addEventListener(
    "click",
    () => {
        window.location.href =
            "/pages/register/register.html";
    }
);

/*
 * Envia o formulário.
 */
elements.form.addEventListener(
    "submit",
    handleLogin
);

/*
 * Estado inicial.
 */
updateButtons();