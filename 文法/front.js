<!-- Front side template -->

<!-- Include Persistence library -->
<script>
// v1.1.8 - https://github.com/SimonLammer/anki-persistence/blob/584396fea9dea0921011671a47a0fdda19265e62/script.js
if(void 0===window.Persistence){var e="github.com/SimonLammer/anki-persistence/",t="_default";if(window.Persistence_sessionStorage=function(){var i=!1;try{"object"==typeof window.sessionStorage&&(i=!0,this.clear=function(){for(var t=0;t<sessionStorage.length;t++){var i=sessionStorage.key(t);0==i.indexOf(e)&&(sessionStorage.removeItem(i),t--)}},this.setItem=function(i,n){void 0==n&&(n=i,i=t),sessionStorage.setItem(e+i,JSON.stringify(n))},this.getItem=function(i){return void 0==i&&(i=t),JSON.parse(sessionStorage.getItem(e+i))},this.removeItem=function(i){void 0==i&&(i=t),sessionStorage.removeItem(e+i)},this.getAllKeys=function(){for(var t=[],i=Object.keys(sessionStorage),n=0;n<i.length;n++){var s=i[n];0==s.indexOf(e)&&t.push(s.substring(e.length,s.length))}return t.sort()})}catch(n){}this.isAvailable=function(){return i}},window.Persistence_windowKey=function(i){var n=window[i],s=!1;"object"==typeof n&&(s=!0,this.clear=function(){n[e]={}},this.setItem=function(i,s){void 0==s&&(s=i,i=t),n[e][i]=s},this.getItem=function(i){return void 0==i&&(i=t),void 0==n[e][i]?null:n[e][i]},this.removeItem=function(i){void 0==i&&(i=t),delete n[e][i]},this.getAllKeys=function(){return Object.keys(n[e])},void 0==n[e]&&this.clear()),this.isAvailable=function(){return s}},window.Persistence=new Persistence_sessionStorage,Persistence.isAvailable()||(window.Persistence=new Persistence_windowKey("py")),!Persistence.isAvailable()){var i=window.location.toString().indexOf("title"),n=window.location.toString().indexOf("main",i);i>0&&n>0&&n-i<10&&(window.Persistence=new Persistence_windowKey("qt"))}}
</script>
<!-- Include Persistence library-->


<div id="displayArea"></div>

<script>
  // Retrieve persistent random index (using key "randomIndex")
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

  try {
    // Parse only the fields needed on the front.
    const questions = safeParse('{{questions}}', 'questions');
    const hints     = safeParse('{{hints}}', 'hints');

    // Convert keys (which are strings) to numbers.
    const keys = Object.keys(questions).map(key => parseInt(key, 10));

    if (keys.length > 0) {
      // If no persistent index exists, pick one randomly and store it.
      if (randomIndex === null || randomIndex === undefined) {
        randomIndex = keys[Math.floor(Math.random() * keys.length)];
        if (Persistence.isAvailable()) {
          Persistence.setItem("randomIndex", randomIndex);
        }
      }
      const key = randomIndex.toString();

      const randQuestion = questions[key];
      const randHint     = hints[key];

      // Display the question and its hint on the front.
      document.getElementById('displayArea').innerHTML = `
        <div class="question">${randQuestion}</div>
        <div class="hint">${randHint}</div>
      `;

      //debug
      // document.getElementById('displayArea').innerHTML += `
      //   <pre>
      //     <strong>Questions:</strong> ${JSON.stringify(questions, null, 2)}
      //     <strong>Hints:</strong> ${JSON.stringify(hints, null, 2)}
      //     <strong>Keys:</strong> ${JSON.stringify(keys)}
      //     <strong>Random Index:</strong> ${randomIndex}
      //   </pre>
      // `;

    } else {
      document.getElementById('displayArea').innerText = 'No data available.';
    }
  } catch (e) {
    console.error(e);
    document.getElementById('displayArea').innerText = e.message;
  }
</script>
