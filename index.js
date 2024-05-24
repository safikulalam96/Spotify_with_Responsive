let currentSong = new Audio();
let songs = [];
let currentIndex = 0;
let currFolder;

function millisecondsToMinutesSeconds(milliseconds) {
    let seconds = milliseconds / 1000;
    return secondsToMinutesSeconds(seconds);
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    let minutesString = minutes < 10 ? '0' + minutes : minutes;
    let secondsString = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return `${minutesString}:${secondsString}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currFolder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let tds = div.querySelectorAll("#wrapper ul li a");
    songs = [];
    for (let index = 1; index < tds.length; index++) {
        const element = tds[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    let songUL = document.querySelector('.songList ul');
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li> 
                <img src="/svgs/music.svg" alt="">
                <div class="more-info">
                    <h3>${decodeURI(song.split('/').pop().replaceAll(".mp3", " "))}</h3>
                    <p>Play Now</p>
                    <img src="/svgs/playbutton.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelectorAll(".songList ul li")).forEach((ul, index) => {
        ul.querySelector(".more-info").addEventListener("click", () => {
            currentIndex = index;
            playMusic(songs[currentIndex]);
        });
    });
    return songs;
}

const playMusic = (track) => {
    currentSong.src = track;
    currentSong.play();
    play.src = "/svgs/pause.svg";
    document.querySelector('.track-name').innerHTML = decodeURI(track.split('/').pop().replaceAll(".mp3", " "));

    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.track-duration').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 90 + "%";
    });

    currentSong.addEventListener('ended', nextSong);


    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100;
    })
};

const nextSong = () => {
    if (currentIndex + 1 < songs.length) {
        currentIndex++;
        playMusic(songs[currentIndex]);
    }
};

const previousSong = () => {
    if (currentIndex > 0) {
        currentIndex--;
        playMusic(songs[currentIndex]);
    }
};

async function displayAblums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardcontainer")
    let anchor = div.getElementsByTagName('a');
    let array = Array.from(anchor)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0]);
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();


            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card"  data-folder="${folder}">
            <img class="playbutton" src="/svgs/playbutton.svg" alt="">
            <img src="/songs/${folder}/cover.jpg"
                alt="">
            <h2 class="invert">${response.title}</h2>
            <p class="invert">${response.description}</p>
        </div>`
        }
    }

    //loading the songs of the album
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    })

    //adding mute function to the code
    document.querySelector(".vol").addEventListener("click", (e) => {

        if (e.target.src.includes("/svgs/voulme.svg")) {
            e.target.src = e.target.src.replace("/svgs/voulme.svg", "/svgs/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("/svgs/mute.svg", "/svgs/voulme.svg")
            // currentSong.volume=.40;
            // document.querySelector(".range").getElementsByTagName("input")[0].value=40;
        }
    })

}
async function main() {

    displayAblums();


    document.querySelector("#next").addEventListener("click", nextSong);
    document.querySelector("#previous").addEventListener("click", previousSong);

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".header .menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0 + "%";
        document.querySelector(".header .menu").style.opacity = 0;

    });

    document.querySelector(".left .cancel-button").addEventListener("click", () => {
        document.querySelector(".left").style.left = -120 + "%";
        document.querySelector(".header .menu").style.opacity = 1;
    });

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "/svgs/playbutton.svg";
        }
    });
}

main();
