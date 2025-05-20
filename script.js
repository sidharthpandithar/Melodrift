
let currentSong = new Audio();
let songs;

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

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/Melodrift/Songs");
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let songList = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < songList.length; index++) {
        const element = songList[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/Songs/")[1])
        }

    }
    return (songs)

}
const playMusic = (track, pause = false) => {
    currentSong.src = "/Melodrift/Songs/" + track;
    if (!pause) {
        currentSong.play()
        play.src = "/Melodrift/assets/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track.replace(".mp3", ""));

}
async function main() {

    let songs = await getSongs();
    playMusic(songs[0])
    let songsUL = document.querySelector(".songslist").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + `<li class="info">
                            <img class="musicImg invert" src="assets/music.svg" alt="" >
                            <div class="infomusiclibrary">
                                <div class="songname"> ${song.replaceAll("%20", " ").replace(".mp3", "").split("-")[0]}</div>
                                <div class="artist">${song.replaceAll("%20", " ").replace(".mp3", "").replaceAll("%2C", "").split("-")[1]}</div>
                            </div>
                                <span class="playNowClass" id = "playingnow">Play Now</span>
                                <img class="invert playNow musicImg" id = "playBtn" src="assets/playicon.svg" alt="">
                        </li>`;


    }


    for (const song of songs) {
        let songsCard = document.querySelector(".cardContainer");
        songsCard.innerHTML = songsCard.innerHTML + `<div class="card"> <div class="play">
                            <img class="invert" src="assets/play.svg" alt="">
                        </div>
                        <img class="thumbnailimg" src="/Melodrift/assets/thumbnail/${song.replaceAll("%20", " ").replace(".mp3", "").split("-")[0].trim()}.jpeg " alt="">
                        <p class="songName carddesc">${song.replaceAll("%20", " ").replace(".mp3", "").split("-")[0]}
                        <p>
                        <p class="singerDetail carddesc">${song.replaceAll("%20", " ").replace(".mp3", "").replaceAll("%2C", "").split("-")[1]}</p>
                    </div> </div>`
    }

    Array.from(document.querySelector(".songsDetail").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            let songname = e.getElementsByClassName("songname")[0].innerHTML.trim();
            let artistname = e.getElementsByClassName("artist")[0].innerHTML.trim();
            playMusic(`${songname} - ${artistname}.mp3`);

            play.src = "/Melodrift/assets/pause.svg"
            activateInfoItemFromCurrentSong()

        })


    })

    Array.from(document.querySelector(".cardContainer").getElementsByTagName("div")).forEach((e) => {
        e.addEventListener("click", () => {
            let songname = e.getElementsByClassName("songName")[0].innerHTML.trim();
            let artistname = e.getElementsByClassName("singerDetail")[0].innerHTML.trim();
            playMusic(`${songname} - ${artistname}.mp3`);
            play.src = "/Melodrift/assets/pause.svg"
            activateInfoItemFromCurrentSong()
        })


    })

    document.querySelector(".songsDetail").addEventListener("click", function (event) {
        const clickedLI = event.target.closest("li");

        if (clickedLI && clickedLI.classList.contains("info")) {
            const allListItems = this.getElementsByTagName("li");

            Array.from(allListItems).forEach(li => {
                li.classList.remove("activeinfo");
                const span = li.querySelector("span");
                if (span) span.innerHTML = "Play Now";
            });
            clickedLI.classList.add("activeinfo");
            const clickedSpan = clickedLI.querySelector("span");
            if (clickedSpan) clickedSpan.innerHTML = "Now Playing";
        }
    });


    function activateInfoItemFromCurrentSong() {
        let currentSongNameRaw = currentSong.src.split("/").pop(); // Get the last part like "SongName - Artist.mp3"
        let currentSongName = decodeURIComponent(currentSongNameRaw.split("-")[0]).trim().toLowerCase();
        const allListItems = document.querySelector(".songsDetail").getElementsByTagName("li");
        Array.from(allListItems).forEach(li => {
            li.classList.remove("activeinfo");
            const span = li.querySelector("span");
            if (span) span.innerHTML = "Play Now";
            const songDiv = li.querySelector(".songname");
            if (!songDiv) return;
            const liSongName = songDiv.innerHTML.trim().toLowerCase().replace(/\s+/g, "");
            if (liSongName === currentSongName.replace(/\s+/g, "")) {
                li.classList.add("activeinfo");
                if (span) span.innerHTML = "Now Playing";
            }
        });
    }

    document.getElementById("searchInput").addEventListener("input", function () {
        
  const searchTerm = this.value.trim().toLowerCase();
  const cards = document.querySelectorAll(".cardContainer .card");

  cards.forEach(card => {
    const songNameDiv = card.querySelector(".songName");
    if (!songNameDiv) return;

    const songName = songNameDiv.textContent.trim().toLowerCase();

    if (songName.includes(searchTerm)) {
      card.style.display = ""; 
    } else {
      card.style.display = "none";
    }
  });
});


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/Melodrift/assets/pause.svg"
            document.getElementById("play").setAttribute("style", "opacity: 0.5")
            activateInfoItemFromCurrentSong()
        }
        else {
            currentSong.pause()
            play.src = "/Melodrift/assets/playicon.svg"
            document.getElementById("play").setAttribute("style", "opacity: 1")
            activateInfoItemFromCurrentSong()
        }
    })
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        activateInfoItemFromCurrentSong()
    })
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = percent * 100 + "%";
        currentSong.currentTime = ((currentSong.duration) * percent);
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(5)[0])
        if (index + 1 > length) {
            playMusic(songs[index + 1])
            activateInfoItemFromCurrentSong()
        }
        play.src = "/Melodrift/assets/pause.svg"
    })
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(5)[0])
        if (index > 0) {
            playMusic(songs[index - 1])
            play.src = "/Melodrift/assets/pause.svg"
            activateInfoItemFromCurrentSong()
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Volume changed to " + e.target.value + "%")
        currentSong.volume = parseInt(e.target.value) / 100;
    })
}

main()

