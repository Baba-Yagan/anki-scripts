<!-- Back side template -->

<!-- Include Persistence library-->
<script>
// v1.1.8 - https://github.com/SimonLammer/anki-persistence/blob/584396fea9dea0921011671a47a0fdda19265e62/script.js
if(void 0===window.Persistence){var e="github.com/SimonLammer/anki-persistence/",t="_default";if(window.Persistence_sessionStorage=function(){var i=!1;try{"object"==typeof window.sessionStorage&&(i=!0,this.clear=function(){for(var t=0;t<sessionStorage.length;t++){var i=sessionStorage.key(t);0==i.indexOf(e)&&(sessionStorage.removeItem(i),t--)}},this.setItem=function(i,n){void 0==n&&(n=i,i=t),sessionStorage.setItem(e+i,JSON.stringify(n))},this.getItem=function(i){return void 0==i&&(i=t),JSON.parse(sessionStorage.getItem(e+i))},this.removeItem=function(i){void 0==i&&(i=t),sessionStorage.removeItem(e+i)},this.getAllKeys=function(){for(var t=[],i=Object.keys(sessionStorage),n=0;n<i.length;n++){var s=i[n];0==s.indexOf(e)&&t.push(s.substring(e.length,s.length))}return t.sort()})}catch(n){}this.isAvailable=function(){return i}},window.Persistence_windowKey=function(i){var n=window[i],s=!1;"object"==typeof n&&(s=!0,this.clear=function(){n[e]={}},this.setItem=function(i,s){void 0==s&&(s=i,i=t),n[e][i]=s},this.getItem=function(i){return void 0==i&&(i=t),void 0==n[e][i]?null:n[e][i]},this.removeItem=function(i){void 0==i&&(i=t),delete n[e][i]},this.getAllKeys=function(){return Object.keys(n[e])},void 0==n[e]&&this.clear()),this.isAvailable=function(){return s}},window.Persistence=new Persistence_sessionStorage,Persistence.isAvailable()||(window.Persistence=new Persistence_windowKey("py")),!Persistence.isAvailable()){var i=window.location.toString().indexOf("title"),n=window.location.toString().indexOf("main",i);i>0&&n>0&&n-i<10&&(window.Persistence=new Persistence_windowKey("qt"))}}
</script>
<!-- Include Persistence library-->

<div id="displayArea"></div>

<script>
  // Retrieve the persistent random index.
  var randomIndex = null;
  if (Persistence.isAvailable()) {
    randomIndex = Persistence.getItem("randomIndex");
  }

  // Utility function to safely parse a JSON field.
  function safeParse(jsonStr, fieldName) {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("Error parsing field '" + fieldName + "' with JSON: " + jsonStr + ". Error: " + e.message);
    }
  }

  // Utility function to generate HTML for audio players.
  function generateAudioHTML(audioList) {
    if (!audioList || audioList.length === 0) {
      return "";
    }
    let html = "";
    // Create an audio element for each file.
    audioList.forEach(function(file) {
      html += `<audio controls src="${file}"></audio>`;
    });
    return html;
  }

  try {
    const questions    = safeParse('{{questions}}', 'questions');
    const fullAnswers  = safeParse('{{full_answers}}', 'full_answers');
    const requested    = safeParse('{{requested}}', 'requested');
    const hints        = safeParse('{{hints}}', 'hints');
    const audioFiles   = safeParse('{{audio_files}}', 'audio_files');
    //const translations = safeParse('{{translations}}', 'translation');

    const keys = Object.keys(questions).map(key => parseInt(key, 10));

    if (keys.length > 0) {
      if (randomIndex === null || randomIndex === undefined) {
        randomIndex = keys[Math.floor(Math.random() * keys.length)];
      }
      const key = randomIndex.toString();

      const randQuestion   = questions[key];
      const randFullAnswer = fullAnswers[key];
      const randRequested  = requested[key];
      const randHint       = hints[key];
      const randAudio      = audioFiles[key];
    //  const randTranslation = "";

      document.getElementById('displayArea').innerHTML = `
        <div class="fullAnswer">${randFullAnswer}</div>
        <div class="requested"><strong>${randRequested}</strong></div>
        <div class="hint">${randHint}</div>
        <div class="audio">${generateAudioHTML(randAudio)}</div>
      `;
//        <div class="translation">${randTranslation}</div>

      // Clear the persistent random index so a new one will be generated on the next card.
      if (Persistence.isAvailable()){
        Persistence.clear();
      }
    } else {
      document.getElementById('displayArea').innerText = 'No data available.';
    }
  } catch (e) {
    console.error(e);
    document.getElementById('displayArea').innerText = e.message;
  }
</script>
