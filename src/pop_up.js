import './assets/pop_up.css';
function showAlert(message) {

    const container = document.getElementById('alert-container');
    const alertBox = document.createElement('div');
    alertBox.className = 'alert_pop_up';
    alertBox.textContent = message;
    container.appendChild(alertBox);


    setTimeout(() => {
        alertBox.remove();
    }, 3000);


}

export default showAlert