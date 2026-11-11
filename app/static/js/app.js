// ==========================================
// MAZEROPAY - CALCULATEUR
// ==========================================

const rates = {
    pcs: {
        name: "Ticket PCS",
        fixed: {
            20: 7500,
            50: 25000,
            100: 54500,
            150: 84000,
            200: 115500
        }
    },
    transcash: {
        name: "Transcash",
        fixed: {
            20: 9000,
            50: 27500,
            100: 59500,
            150: 89500,
            200: 117500
        }
    },
    paypal: {
        name: "Solde PayPal",
        fixed: {
            100: 53000
        }
    },
    sepa: {
        name: "Virement SEPA",
        fixed: {
            50: 26000
        }
    },
    postepay: {
        name: "Postepay",
        rate: 550
    },
    apple: {
        name: "Apple Gift Card"
    },
    steam: {
        name: "Steam Gift Card"
    },
    razer: {
        name: "Razer Gold"
    },
    paysafe: {
        name: "Paysafe"
    }
};


// ==========================================
// ÉLÉMENTS HTML
// ==========================================

const assetSelect = document.getElementById("asset-select");
const amountInput = document.getElementById("amount-input");
const payoutSelect = document.getElementById("payout-select");

const estimateAmount = document.getElementById("estimate-amount");
const estimateEuro = document.getElementById("estimate-euro");
const estimatePayout = document.getElementById("estimate-payout");
const estimateNote = document.getElementById("estimate-note");

const whatsappButton = document.getElementById("whatsapp-offer");
const telegramButton = document.getElementById("telegram-offer");


// ==========================================
// FORMATAGE DES NOMBRES
// ==========================================

function formatNumber(value) {
    return new Intl.NumberFormat("fr-FR").format(value);
}


// ==========================================
// MISE À JOUR DES LIENS DE CONTACT
// ==========================================

function updateContactLinks(result) {
    const asset = assetSelect.value;
    const amount = Number(amountInput.value);
    const payout = payoutSelect.value;

    const assetName = rates[asset]?.name || asset;

    let message;

    if (result !== null) {
        message =
            `Bonjour MazeroPay,\n\n` +
            `Je souhaite obtenir des informations sur une demande d'estimation.\n\n` +
            `Actif : ${assetName}\n` +
            `Montant : ${amount} €\n` +
            `Moyen de réception souhaité : ${payout}\n` +
            `Estimation indicative : ${formatNumber(result)} FCFA\n\n` +
            `Merci de me confirmer les conditions.`;
    } else {
        message =
            `Bonjour MazeroPay,\n\n` +
            `Je souhaite obtenir des informations sur vos services.\n\n` +
            `Actif : ${assetName}\n` +
            `Montant souhaité : ${amountInput.value || "Non précisé"} €\n` +
            `Moyen de réception : ${payout}\n\n` +
            `Merci de me renseigner.`;
    }

    whatsappButton.href =
        `https://wa.me/2250799081766?text=${encodeURIComponent(message)}`;

    telegramButton.dataset.message = message;
}


// ==========================================
// CALCUL DE L'ESTIMATION
// ==========================================

function calculateEstimate() {
    const asset = assetSelect.value;
    const amount = Number(amountInput.value);
    const payout = payoutSelect.value;

    // Vérification du montant minimum et des multiples de 5
    if (
        amountInput.value.trim() === "" ||
        !Number.isFinite(amount) ||
        amount < 20 ||
        amount % 5 !== 0
    ) {
        estimateAmount.textContent = "—";
        estimateEuro.textContent = "—";
        estimatePayout.textContent = payout;

        estimateNote.textContent =
            "Le montant minimum est de 20 € et doit être un multiple de 5.";

        updateContactLinks(null);
        return;
    }

    const selectedRate = rates[asset];

    let result = null;

    // Application des tarifs fixes
    if (selectedRate.fixed) {
        result = selectedRate.fixed[amount] ?? null;
    }

    // Calcul du tarif proportionnel Postepay
    else if (selectedRate.rate) {
        result = amount * selectedRate.rate;
    }

    // Tarif disponible uniquement sur demande
    if (result === null) {
        estimateAmount.textContent = "Sur demande";
        estimateEuro.textContent =
            `${formatNumber(amount)} € - ${selectedRate.name}`;
        estimatePayout.textContent = payout;

        estimateNote.textContent =
            "Ce montant ne dispose pas encore d'un tarif de référence. Contactez-nous pour obtenir une confirmation.";

        updateContactLinks(null);
        return;
    }

    // Affichage de l'estimation
    estimateAmount.textContent = formatNumber(result);
    estimateEuro.textContent =
        `${formatNumber(amount)} € - ${selectedRate.name}`;
    estimatePayout.textContent = payout;

    estimateNote.textContent =
        "Estimation indicative, à confirmer avant toute opération.";

    updateContactLinks(result);
}


// ==========================================
// ÉVÉNEMENTS DU CALCULATEUR
// ==========================================

assetSelect.addEventListener("change", calculateEstimate);
amountInput.addEventListener("input", calculateEstimate);
payoutSelect.addEventListener("change", calculateEstimate);

document
    .getElementById("conversion-form")
    .addEventListener("submit", function (event) {
        event.preventDefault();
        calculateEstimate();
    });


// ==========================================
// SÉLECTION DES TARIFS
// ==========================================

const rateButtons = document.querySelectorAll(".rate-choice");

rateButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const asset = this.dataset.asset;
        const amount = this.dataset.amount;

        assetSelect.value = asset;
        amountInput.value = amount;

        calculateEstimate();

        document.getElementById("accueil").scrollIntoView({
            behavior: "smooth"
        });
    });
});


// ==========================================
// BOUTON TELEGRAM
// ==========================================

telegramButton.addEventListener("click", async function () {
    const message = this.dataset.message;

    if (!message) {
        return;
    }

    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(message);
        } catch (error) {
            console.warn("Impossible de copier le message :", error);
        }
    }
});


// ==========================================
// ANNÉE AUTOMATIQUE DU FOOTER
// ==========================================

document.getElementById("current-year").textContent =
    new Date().getFullYear();


// ==========================================
// INITIALISATION
// ==========================================

calculateEstimate();