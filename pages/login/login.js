/*
 * =====================================================
 * LOGIN
 * Controle de Gastos
 *
 * Responsável por:
 *
 * - validar email
 * - validar senha
 * - controlar estado do formulário
 * - mostrar/esconder senha
 * - realizar login
 * - redirecionar para Home
 * - abrir cadastro
 *
 * Este arquivo não depende de validations.js.
 * =====================================================
 */


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
 * =====================================================
 * ESTADO
 * =====================================================
 */

const state = {

    emailTouched: false,

    passwordTouched: false,

    submitting: false

};


/*
 * =====================================================
 * VALIDAÇÃO DE EMAIL
 * =====================================================
 *
 * A validação pertence ao módulo de login.
 *
 * Não dependemos mais de:
 *
 * validations.js
 *
 * Isso evita uma dependência global desnecessária.
 * =====================================================
 */

function validateEmail(email) {

    const normalizedEmail =
        String(email)
            .trim()
            .toLowerCase();

    if (!normalizedEmail) {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(normalizedEmail);

}


/*
 * =====================================================
 * OBTÉM ERRO DO EMAIL
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


/*
 * =====================================================
 * OBTÉM ERRO DA SENHA
 * =====================================================
 */

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


/*
 * =====================================================
 * RENDERIZA VALIDAÇÃO DO EMAIL
 * =====================================================
 */

function renderEmailValidation() {

    const error =
        getEmailError();


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


/*
 * =====================================================
 * RENDERIZA VALIDAÇÃO DA SENHA
 * =====================================================
 */

function renderPasswordValidation() {

    const error =
        getPasswordError();


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


/*
 * =====================================================
 * VALIDADE DO FORMULÁRIO
 * =====================================================
 */

function isFormValid() {

    return (
        !getEmailError() &&
        !getPasswordError()
    );

}


/*
 * =====================================================
 * ATUALIZA BOTÕES
 * =====================================================
 */

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

function showFeedback(
    message,
    type
) {

    elements.loginMessage.textContent =
        message;


    elements.loginMessage.className =
        `feedback feedback-${type}`;


    elements.loginMessage.hidden =
        false;

}


function hideFeedback() {

    elements.loginMessage.hidden =
        true;


    elements.loginMessage.textContent =
        "";


    elements.loginMessage.className =
        "feedback";

}


/*
 * =====================================================
 * ESTADO DE ENVIO
 * =====================================================
 */

function setSubmitting(
    submitting
) {

    state.submitting =
        submitting;


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


    state.emailTouched =
        true;


    state.passwordTouched =
        true;


    renderEmailValidation();

    renderPasswordValidation();

    updateButtons();


    /*
     * Impede envio com formulário inválido.
     */

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


    let loginSucceeded =
        false;


    try {

        const response =
            await fetch(
                "/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify({
                            email:
                                elements.email
                                    .value
                                    .trim(),

                            password:
                                elements.password
                                    .value
                        })
                }
            );


        /*
         * Tenta interpretar a resposta
         * como JSON.
         */

        const result =
            await response.json();


        /*
         * Backend recusou o login.
         */

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Não foi possível entrar."
            );

        }


        loginSucceeded =
            true;


        showFeedback(
            "Login confirmado. Abrindo seu painel...",
            "success"
        );


        /*
         * Pequeno intervalo para que
         * a mensagem de sucesso seja
         * percebida pelo usuário.
         */

        window.setTimeout(
            () => {

                window.location.href =
                    "/pages/home/home.html";

            },
            350
        );

    } catch (error) {

        console.error(
            "Erro ao realizar login:",
            error
        );


        showFeedback(
            error.message ||
            "Não foi possível realizar o login.",
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
 * EVENTOS — EMAIL
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

        state.emailTouched =
            true;


        renderEmailValidation();

        updateButtons();

    }
);


/*
 * =====================================================
 * EVENTOS — SENHA
 * =====================================================
 */

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

        state.passwordTouched =
            true;


        renderPasswordValidation();

        updateButtons();

    }
);


/*
 * =====================================================
 * MOSTRAR / ESCONDER SENHA
 * =====================================================
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
 * =====================================================
 * RECUPERAÇÃO DE SENHA
 * =====================================================
 *
 * A funcionalidade real será implementada
 * posteriormente.
 * =====================================================
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
 * =====================================================
 * CADASTRO
 * =====================================================
 */

elements.registerButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "/pages/register/register.html";

    }
);


/*
 * =====================================================
 * ENVIO DO FORMULÁRIO
 * =====================================================
 */

elements.form.addEventListener(
    "submit",
    handleLogin
);


/*
 * =====================================================
 * ESTADO INICIAL
 * =====================================================
 */

updateButtons();