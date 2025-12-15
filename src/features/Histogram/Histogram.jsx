import Navbar from './layouts/navbar'
//TODO: finir la page histogramme
function Histogram(){
    return (
        <div className='Main'>
            <Navbar />
            <h1>Name of the question</h1>
            <div className='Square'>
                <img src="../assets/icon/arrow_circle_left_24pixel.png"></img>
                <div className='menu-list'>
                    <li>
                        <ul>Joueur 1</ul>
                        <ul>Joueur 2</ul>
                        <ul>Joueur 3</ul>
                        <ul>Joueur 4</ul>
                    </li>
                </div>

            </div>
            <div className='row'>
                <div className='col-6'>
                    <p>Afficher la réponse</p>
                </div>
                <div className='col-6'>
                    <p>Suivant</p>
                </div>
            </div>


        </div>
    )
}

export default Histogram