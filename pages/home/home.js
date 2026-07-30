/*
 * Elementos da página.
 */
const totalGastosElement =
    document.getElementById("total-gastos");

const quantidadeGastosElement =
    document.getElementById("quantidade-gastos");

const cacheBadgeElement =
    document.getElementById("cache-badge");

const dataSourceElement =
    document.getElementById("data-source");

const responseTimeElement =
    document.getElementById("response-time");

const generatedAtElement =
    document.getElementById("generated-at");

const statusMessageElement =
    document.getElementById("status-message");

const reloadButton =
    document.getElementById("reload-button");

const clearCacheButton =
    document.getElementById("clear-cache-button");

const userInformationElement =
    document.getElementById("user-information");

const logoutButton =
    document.getElementById("logout-button");


/*
 * Verifica se existe uma sessão válida.
 */
async function checkSession() {
    try {
        const response = await fetch(
            "/api/session",
            {
                credentials: "same-origin"
            }
        );

        if (!response.ok) {
            window.location.replace("/");
            return false;
        }

        const result = await response.json();

        userInformationElement.textContent =
            `${result.user.name} — ${result.user.email}`;

        return true;
    } catch (error) {
        console.error(error);

        userInformationElement.textContent =
            "Erro ao verificar a sessão.";

        return false;
    }
}

/*
 * Encerra a sessão.
 */
async function logout() {
    logoutButton.disabled = true;

    try {
        await fetch(
            "/api/logout",
            {
                method: "POST",
                credentials: "same-origin"
            }
        );
    } catch (error) {
        console.error(error);
    } finally {
        window.location.replace("/");
    }
}
/*
 * Formata um valor como moeda brasileira.
 *
 * Exemplo:
 *
 * 1589.42 → R$ 1.589,42
 */
function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);
}

/*
 * Ativa ou desativa os botões.
 */
function setButtonsDisabled(disabled) {
    reloadButton.disabled = disabled;
    clearCacheButton.disabled = disabled;
}

/*
 * Exibe o estado visual do cache.
 */
function showCacheStatus(cacheStatus) {
    const normalizedStatus =
        cacheStatus.toLowerCase();

    cacheBadgeElement.textContent =
        `Cache ${cacheStatus}`;

    cacheBadgeElement.className =
        `cache-badge ${normalizedStatus}`;
}

/*
 * Limpa os dados visíveis da tela.
 */
function clearVisibleData() {
    totalGastosElement.textContent = "R$ --";
    quantidadeGastosElement.textContent = "--";
    dataSourceElement.textContent = "--";
    responseTimeElement.textContent = "--";
    generatedAtElement.textContent = "--";

    cacheBadgeElement.textContent = "Cache vazio";
    cacheBadgeElement.className =
        "cache-badge empty";
}

/*
 * Consulta o resumo no backend.
 */
async function loadSummary() {
    setButtonsDisabled(true);

    statusMessageElement.textContent =
        "Consultando o backend...";

    statusMessageElement.className =
        "status-message loading";

    try {
        /*
         * Faz uma requisição GET.
         *
         * Caminho:
         * Navegador → Nginx → Backend → Redis
         */
        const response = await fetch(
            "/api/gastos/resumo"
        );

        const result = await response.json();

        if (response.status === 401) {
            window.location.replace("/");
            return;}

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Erro ao consultar o resumo."
            );
        }

        /*
         * Atualiza os valores da página.
         */
        totalGastosElement.textContent =
            formatCurrency(result.data.totalGastos);

        quantidadeGastosElement.textContent =
            result.data.quantidadeGastos;

        document.querySelectorAll(".value-box").forEach((box) => {
            box.classList.remove("data-loaded");
            void box.offsetWidth;
            box.classList.add("data-loaded");
        });

        dataSourceElement.textContent =
            result.source === "redis"
                ? "Redis"
                : "Backend";

        responseTimeElement.textContent =
            `${result.durationMilliseconds} ms`;

        generatedAtElement.textContent =
            new Date(
                result.data.generatedAt
            ).toLocaleString("pt-BR");

        showCacheStatus(result.cache);

        statusMessageElement.textContent =
            result.message;

        statusMessageElement.className =
            result.cache === "HIT"
                ? "status-message success"
                : "status-message warning";
    } catch (error) {
        console.error(error);

        statusMessageElement.textContent =
            error.message;

        statusMessageElement.className =
            "status-message error";
    } finally {
        setButtonsDisabled(false);
    }
}

/*
 * Solicita ao backend que remova o cache.
 */
async function clearCache() {
    setButtonsDisabled(true);

    statusMessageElement.textContent =
        "Removendo o cache...";

    statusMessageElement.className =
        "status-message loading";

    try {
        /*
         * Faz uma requisição DELETE.
         */
        const response = await fetch(
            "/api/cache/gastos/resumo",
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (response.status === 401) {
            window.location.replace("/");
            return;}

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Erro ao limpar o cache."
            );
        }

        clearVisibleData();

        statusMessageElement.textContent =
            `${result.message} Clique em “Consultar novamente” para criar um cache novo.`;

        statusMessageElement.className =
            "status-message success";
    } catch (error) {
        console.error(error);

        statusMessageElement.textContent =
            error.message;

        statusMessageElement.className =
            "status-message error";
    } finally {
        setButtonsDisabled(false);
    }
}

/*
 * Configura os eventos dos botões.
 */
reloadButton.addEventListener(
    "click",
    loadSummary
);

clearCacheButton.addEventListener(
    "click",
    clearCache
);

logoutButton.addEventListener(
    "click",
    logout
);

/*
 * Primeiro verifica a sessão.
 * Só depois consulta os gastos.
 */
async function initializePage() {
    const authenticated =
        await checkSession();

    if (authenticated) {
        await loadSummary();
    }
}

initializePage();