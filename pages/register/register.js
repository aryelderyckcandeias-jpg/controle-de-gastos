/*
 * =====================================================
 * REGISTER
 * Controle de Gastos
 *
 * Responsável por:
 *
 * - validar o formulário
 * - controlar o botão
 * - impedir submit padrão do navegador
 * - preparar o fluxo de cadastro
 * - redirecionar corretamente para o login
 *
 * O cadastro real na API será conectado depois que
 * confirmarmos o endpoint existente no backend.
 * =====================================================
 */

"use strict";


/*
 * =====================================================
 * ELEMENTOS
 * =====================================================
 */

const form =
    document.getElementById(
        "register-form"
    );

const nameInput =
    document.getElementById(
        "name"
    );

const emailInput =
    document.getElementById(
        "register-email"
    );

const passwordInput =
    document.getElementById(
        "register-password"
    );

const termsInput =
    document.getElementById(
        "register-terms"
    );

const submitButton =
    document.getElementById(
        "register-submit"
    );

const message =
    document.getElementById(
        "register-message"
    );


/*
 * =====================================================
 * ESTADO
 * =====================================================
 */

let submitting = false;


/*
 * =====================================================
 * MOSTRAR MENSAGEM
 * =====================================================
 */

function showMessage(
    text,
    type = "info"
) {

    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        `register-message ${type}`;


    message.hidden =
        false;

}


/*
 * =====================================================
 * ESCONDER MENSAGEM
 * =====================================================
 */

function hideMessage() {

    if (!message) {
        return;
    }


    message.textContent =
        "";


    message.className =
        "register-message";


    message.hidden =
        true;

}


/*
 * =====================================================
 * VALIDAR EMAIL
 * =====================================================
 */

function validateEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email.trim()
        );

}


/*
 * =====================================================
 * VALIDAR FORMULÁRIO
 * =====================================================
 */

function validateForm() {

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    const terms =
        termsInput.checked;


    if (name.length < 2) {

        showMessage(
            "Digite seu nome completo.",
            "error"
        );

        nameInput.focus();

        return false;

    }


    if (!validateEmail(email)) {

        showMessage(
            "Digite um e-mail válido.",
            "error"
        );

        emailInput.focus();

        return false;

    }


    if (password.length < 6) {

        showMessage(
            "A senha precisa ter pelo menos 6 caracteres.",
            "error"
        );

        passwordInput.focus();

        return false;

    }


    if (!terms) {

        showMessage(
            "Você precisa aceitar os Termos de Uso e a Política de Privacidade.",
            "error"
        );

        termsInput.focus();

        return false;

    }


    return true;

}


/*
 * =====================================================
 * ESTADO DO BOTÃO
 * =====================================================
 */

function updateButton() {

    if (!submitButton) {
        return;
    }


    const nameValid =
        nameInput.value.trim().length >= 2;


    const emailValid =
        validateEmail(
            emailInput.value
        );


    const passwordValid =
        passwordInput.value.length >= 6;


    const termsValid =
        termsInput.checked;


    submitButton.disabled =
        !(
            nameValid &&
            emailValid &&
            passwordValid &&
            termsValid
        ) ||
        submitting;

}


/*
 * =====================================================
 * SUBMIT
 * =====================================================
 */

async function handleSubmit(
    event
) {

    event.preventDefault();


    if (submitting) {
        return;
    }


    hideMessage();


    if (!validateForm()) {

        updateButton();

        return;

    }


    submitting =
        true;


    updateButton();


    showMessage(
        "Preparando seu cadastro...",
        "loading"
    );


    /*
     * IMPORTANTE:
     *
     * Ainda não fazemos POST para a API.
     *
     * Primeiro precisamos confirmar o endpoint
     * real existente no backend.
     *
     * Assim evitamos inventar uma rota e quebrar
     * a arquitetura atual.
     */


    window.setTimeout(
        () => {

            window.location.href =
                "../login/login.html";

        },
        800
    );

}


/*
 * =====================================================
 * EVENTOS
 * =====================================================
 */

nameInput.addEventListener(
    "input",
    () => {

        hideMessage();

        updateButton();

    }
);


emailInput.addEventListener(
    "input",
    () => {

        hideMessage();

        updateButton();

    }
);


passwordInput.addEventListener(
    "input",
    () => {

        hideMessage();

        updateButton();

    }
);


termsInput.addEventListener(
    "change",
    () => {

        hideMessage();

        updateButton();

    }
);


form.addEventListener(
    "submit",
    handleSubmit
);


/*
 * =====================================================
 * ESTADO INICIAL
 * =====================================================
 */

updateButton();