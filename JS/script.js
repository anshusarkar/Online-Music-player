console.log('lets write Javascript');
let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Show all the songs in the paylist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li> 
                            <img class="invert" src="Svgs/UI/music.svg" alt="" srcset="">
                            <div class="info">
                                <div>${song}</div>
                                <div>Neo</div>
                            </div>
                            <div class="playnow">
                                <span>Play</span>
                                    <img class="invert" src="Svgs/playbar_icons/play-svgrepo-com.svg" alt="" srcset="" style = 
                                    width="20px" height="20px">
                            </div>
                         </li>`;

    }
    // Attach an event lsitener
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        console.log()
    })
    return songs ;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/Songs/"+track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "Svgs/playbar_icons/pause-svgrepo-com.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Songs/`)
    let response = await a.text()
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the meta data  of the folders 
            let a = await fetch(`http://127.0.0.1:3000/Songs/${folder}/info.json`)
            let response = await a.json();;
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div data-folder="" class="play">
                            <?xml version="1.0" encoding="iso-8859-1"?>
                            <!-- Modified SVG: Black border, White inside & Play icon -->
                            <svg height="40px" width="40px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60" xml:space="preserve">
                                <g>
                                    Outer Circle (Border)
                                    <circle cx="30" cy="30" r="28" fill="white" stroke="black" stroke-width="1" />

                                    <!-- Play Icon -->
                                    <polygon points="24,16 24,44 43,30" fill="black" />
                                </g>
                            </svg>
                        </div>
                        <img src="/Songs/${folder}/Cover.jpg" alt="" srcset="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    // Load the libary when ever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {

    // Get the list of all the songs

    await getSongs("Songs/Anime_Osts")
    console.log(songs);
    playMusic(songs[0], true)


    // Display all the albums on the page
    displayAlbums()



    //Attach event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "Svgs/playbar_icons/pause-svgrepo-com.svg"
        }
        else {
            currentSong.pause()
            play.src = "Svgs/playbar_icons/play-svgrepo-com.svg"
        }
    })

    console.log(songs);

    // Play the first song
    var audio = new Audio(songs[0])
    // audio.play();

    audio.addEventListener("onetimeupdate", () => {
        console.log(audio.duration, audio.currentSrc, audio.currentTime);

    });

    // Listen for time update

    currentSong.addEventListener('timeupdate', () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // add an event listner to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })
    // add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // add an event listner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })
    // add an eventlistner to previous and next
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })
    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(currentSong);
        if ((index + 1) < songs.length - 1) {
            playMusic(songs[index + 1])
        }
    })
    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Volume is : ", e.target.value, "% out of 100 %");
        currentSong.volume = parseInt(e.target.value) / 100

    })

    // add event listner to mute the track 
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
            if(e.target.src.includes("volume.svg")){
                e.target.src = e.target.src.replace("volume.svg", "mute.svg")
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            }
            else{
                e.target.src = e.target.src.replace("mute.svg", "volume.svg")
                currentSong.volume = .10;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            }

        })

    // add an event listner to chnage the play button to pause 
    




}
main()