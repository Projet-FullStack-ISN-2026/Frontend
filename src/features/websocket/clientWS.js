/**
 * Client WebSocket optimise avec Promesses.
 * Permet d'appeler les methodes d'envoi sans attendre manuellement l'ouverture du socket.
 */

/**
 * 
 * /!\ Decommenter l'export default pour exporter la classe en React
 * 
 *  */ 
export default class ClientWS {

    constructor() {
        // Création de l'URL
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = '10.3.70.9';
        const port =':3128';
        const serverPath = 'ws/quiz';
        this.url = `${protocol}://${host}${port}/${serverPath}`;
        this.socket = null;
        
        // Cette promesse stockera l'etat de la connexion
        this.connectionPromise = null;

        // Callbacks pour la reception (UI)
        this.onMessageReceived = (msg) => console.log("Message recu:", msg); // Fonction a surcharger pour recuperer et traiter les messages
        this.onDisconnected = () => console.warn("Animateur deconnecte");
    }

    /**
     * Etablit la connexion avec le serveur WebSocket et retourne une Promesse.
     * La promesse se resout une fois le WebSocket "OPEN".
     */
    connect() {
        this.connectionPromise = new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.url);
            
            this.socket.onopen = () => {
                console.log("Connexion au WebSocket effective.");
                resolve();
            };

            this.socket.onerror = (error) => {
                console.error("Erreur de connexion WebSocket : ", error);
                reject(error);
            };

            this.socket.onclose = () => {
                console.warn("Fermeture du WebSocket.");
                this.onDisconnected();
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.onMessageReceived(message);
                } catch (e) {
                    console.error("Erreur lecture du message en JSON : ", e);
                }
            };
        });

        return this.connectionPromise;
    }

    /**
     * Methode d'envoi d'un message ASYNCHRONE 
     * attendant automatiquement que la connexion soit etablie avant d'envoyer
     */
    async _send(type, payload = {}) {
        try {
            // On attend que la promesse de connexion soit resolue
            await this.connectionPromise; 

            // Si le socket existe et qu'il est ouvert
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                const message = { type, ...payload };
                this.socket.send(JSON.stringify(message));
                console.log(`Envoi du message : ${JSON.stringify(message)}`);
            } else {
                console.error("Erreur : WebSocket non ouvert");
            }
        } catch (error) {
            console.error("Impossible d'envoyer, echec de connexion :", error);
        }
    }

    // ============================================================
    // METHODES ENVOI DE MESSAGE
    // ============================================================

    // Methode de test
    test() {
        this._send("test");
    }

    /**
     * Diffusion de la question et des options de reponse.
     * Correspond au step 10
     * * @param {Object} questionObj - L'objet de la question 
     * @param {Array} optionsList - La liste des options possibles sans indiquer laquelle est correcte
     */
    nextQuestion(questionObj, optionsList) {
        this._send("NEXT_QUESTION", { 
            step: 10,
            question: questionObj, 
            options: optionsList 
        });
    }

    /**
     * Diffusion des statistiques de vote.
     * Correspond au step 20
     * * @param {number} totalVotes - Le nombre total de joueurs ayant repondu
     * @param {Array} optionsStats - La liste des options enrichie avec 'count' (nombre de votant pour cette reponse) et 'percentage' (poucentage de votant)
     */
    showStats(totalVotes, optionsStats) {
        this._send("SHOW_STATS", { 
            step: 20,
            totalvotes: totalVotes,
            options: optionsStats
        });
    }

    /**
     * Diffusion de la bonne reponse
     * Correspond au step 30
     * * @param {Object} correctOptionObj - L'objet complet de la bonne reponse
     */
    showAnswer(correctOptionObj) {
        this._send("SHOW_ANSWER", { 
            step: 30,
            option: correctOptionObj
        });
    }

    /**
     * Diffusion du classement
     * Correspond au step 40
     * * @param {Array} rankingList - Liste triee des joueurs avec score et rang
     */
    showClassement(rankingList) {
        this._send("SHOW_CLASSEMENT", { 
            step: 40,
            ranking: rankingList
        });
    }
}