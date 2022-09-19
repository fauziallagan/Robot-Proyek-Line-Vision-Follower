var href = location.href;
if (href.indexOf("?") != -1) {
  document.getElementById("ip").value = location.search.split("?")[1].replace(/http:\/\//g, "");
} else if (href.indexOf("http") != -1) {
  document.getElementById("ip").value = location.host;
}

function start() {
  window.stop();

  var baseHost = 'http://' + document.getElementById("ip").value; //var baseHost = document.location.origin
  var streamUrl = baseHost + ':81'

  const hide = el => {
    el.classList.add('hidden')
  }
  const show = el => {
    el.classList.remove('hidden')
  }

  const disable = el => {
    el.classList.add('disabled')
    el.disabled = true
  }

  const enable = el => {
    el.classList.remove('disabled')
    el.disabled = false
  }

  const updateValue = (el, value, updateRemote) => {
    updateRemote = updateRemote == null ? true : updateRemote
    let initialValue
    if (el.type === 'checkbox') {
      initialValue = el.checked
      value = !!value
      el.checked = value
    } else {
      initialValue = el.value
      el.value = value
    }
    el.title = value;

    if (updateRemote && initialValue !== value) {
      updateConfig(el);
    }
  }

  function updateConfig(el) {
    let value
    switch (el.type) {
      case 'checkbox':
        value = el.checked ? 1 : 0
        break
      case 'range':
      case 'select-one':
        value = el.value
        break
      case 'button':
      case 'submit':
        value = '1'
        break
      default:
        return
    }

    const query = `${baseHost}/control?var=${el.id}&val=${value}`
    el.title = value;

    fetch(query)
      .then(response => {
        console.log(`request to ${query} finished, status: ${response.status}`)
      })
  }

  document
    .querySelectorAll('.close')
    .forEach(el => {
      el.onclick = () => {
        hide(el.parentNode)
      }
    })

  // read initial values
  fetch(`${baseHost}/status`)
    .then(function (response) {
      return response.json()
    })
    .then(function (state) {
      document
        .querySelectorAll('.default-action')
        .forEach(el => {
          updateValue(el, state[el.id], false)
        })
      result.innerHTML = "Connection successful";
    })

  const view = document.getElementById('stream')
  const viewContainer = document.getElementById('stream-container')
  const stillButton = document.getElementById('get-still')
  const streamButton = document.getElementById('toggle-stream')
  const closeButton = document.getElementById('close-stream')
  const restartButton = document.getElementById('restartButton')

  const stopStream = () => {
    //window.stop();
    streamButton.innerHTML = 'Start Stream';
    hide(viewContainer)
  }

  const startStream = () => {
    view.src = `${streamUrl}/stream`
    show(viewContainer)
    streamButton.innerHTML = 'Stop Stream'
  }

  //Menambahkan acara klik tombol daya restart (format parameter khusus：http://192.168.xxx.xxx/control?cmd=P1;P2;P3;P4;P5;P6;P7;P8;P9)
  restartButton.onclick = () => {
    fetch(baseHost + "/control?restart");
  }

  // Attach actions to buttons
  stillButton.onclick = () => {
    stopStream()
    view.src = `${baseHost}/capture?_cb=${Date.now()}`
    show(viewContainer)
  }

  closeButton.onclick = () => {
    stopStream()
    hide(viewContainer)
  }

  streamButton.onclick = () => {
    const streamEnabled = streamButton.innerHTML === 'Stop Stream'
    if (streamEnabled) {
      stopStream()
    } else {
      startStream()
    }
  }

  // Attach default on change action
  document
    .querySelectorAll('.default-action')
    .forEach(el => {
      el.onchange = () => updateConfig(el)
    })

  // Kategori kustom tindakan saya, nilai tampilan atribut judul
  document
    .querySelectorAll('.my-action')
    .forEach(el => {
      el.title = el.value;
      el.onchange = () => el.title = el.value;
    })

  // Custom actions

  const framesize = document.getElementById('framesize')

  framesize.onchange = () => {
    updateConfig(framesize)
  }
}


//variabel 
const aiView = document.getElementById('stream');
const aiStill = document.getElementById('get-still')
const canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
const canvas_pixel = document.getElementById('canvas_pixel');
var context_pixel = canvas_pixel.getContext('2d');
const nostop = document.getElementById('nostop');
const detectState = document.getElementById('detectState');
const autodetect = document.getElementById('autodetect');
const motorState = document.getElementById('motorState');
const servo = document.getElementById('servo');
const panel = document.getElementById('panel');
const result = document.getElementById('result');
const ip = document.getElementById('ip');

const pixelState = document.getElementById('pixel');
const rectheight = document.getElementById('rectheight');
const Rmin = document.getElementById('Rmin');
const Rmax = document.getElementById('Rmax');
const Gmin = document.getElementById('Gmin');
const Gmax = document.getElementById('Gmax');
const Bmin = document.getElementById('Bmin');
const Bmax = document.getElementById('Bmax');
const turnDelayMax = document.getElementById('turnDelayMax'); //delay belok maksimal
const turnDelayMin = document.getElementById('turnDelayMin'); //delay belok minimal
const forwardDelay = document.getElementById('forwardDelay'); //delay maju
var servoAngle = 30; //posisi set servo
var lastDirection = ""; // catatan rute terakhir

const tracker = new tracking.ColorTracker();

panel.onchange = function (e) {
  if (!panel.checked)
    buttonPanel.style.display = "none";
  else
    buttonPanel.style.display = "block";
}

function car(query) {
  query = "http:\/\/" + ip.value + query;
  fetch(query)
    .then(response => {
      console.log(`request to ${query} finished, status: ${response.status}`)
    })
}

function noStop() {
  if (!nostop.checked) {
    car('/control?var=car&val=3');
  }
}

detectState.onclick = function () {
  if (detectState.checked == true) {
    aiView.style.display = "none";
    canvas.style.display = "block";
    aiStill.click();
  } else {
    aiView.style.display = "block";
    canvas.style.display = "none";
  }
}

pixel.onclick = function () {
  if (pixelState.checked == true) {
    canvas_pixel.style.display = "block";
  } else {
    canvas_pixel.style.display = "none";
  }
}

function stopDetection() {
  detectState.checked = false;
  aiView.style.display = "block";
  canvas.style.display = "none";
}

aiView.onload = function (event) {
  if (detectState.checked == false) return;

  canvas.setAttribute("width", aiView.width);
  canvas.setAttribute("height", aiView.height);
  canvas_pixel.setAttribute("width", aiView.width);
  canvas_pixel.setAttribute("height", aiView.height);
  context.drawImage(aiView, 0, 0, aiView.width, aiView.height);

  var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  var y1 = aiView.height / 2 - Number(rectheight.value) / 2;
  var y2 = aiView.height / 2 + Number(rectheight.value) / 2;

  for (var i = 0; i < imgData.data.length; i += 4) {
    var r = 0;
    var g = 0;
    var b = 0;
    if ((imgData.data[i] >= Rmin.value && imgData.data[i] <= Rmax.value) && (imgData.data[i + 1] >= Gmin.value &&
        imgData.data[i + 1] <= Gmax.value) && (imgData.data[i + 2] >= Bmin.value && imgData.data[i + 2] <= Bmax
        .value)) {
      if (aiView.width * 4 * y1 <= i && aiView.width * 4 * y2 >= i)
        r = 255;
      else
        r = 0;
    }

    imgData.data[i] = r;
    imgData.data[i + 1] = g;
    imgData.data[i + 2] = b;
    imgData.data[i + 3] = 255;
  }
  context_pixel.putImageData(imgData, 0, 0);

  tracking.track('#canvas_pixel', tracker);

  context.strokeStyle = "cyan";
  context.fillStyle = "cyan";
  context.lineWidth = 5;
  context.beginPath();
  context.arc(leftpoint.value * aiView.width / 2, aiView.height / 2, 3, 6.284, false, false, '#ff0000', 0, 1);
  context.fill();
  context.beginPath();
  context.arc(aiView.width / 2 + rightpoint.value * aiView.width / 2, aiView.height / 2, 3, 6.284, false, false,
    '#ff0000', 0, 1);
  context.fill();
}

tracking.ColorTracker.registerColor('red', function (r, g, b) {
  if ((r == 255) && (g == 0) && (b == 0)) {
    return true;
  }
  return false;
});

var trackedColors = {
  custom: true
};

Object.keys(tracking.ColorTracker.knownColors_).forEach(function (color) {
  trackedColors[color] = true;
});

var colors = [];
for (var color in trackedColors) {
  if (trackedColors[color]) {
    colors.push(color);
  }
}
tracker.setColors(colors);

tracker.on('track', function (event) {

  event.data.forEach(function (rect) {
    context.strokeStyle = rect.color;
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    //context.font = '11px Helvetica';
    //context.fillStyle = "#fff";
    //context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
    //context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);

    //result.innerHTML+= rect.color+","+rect.x+","+rect.y+","+rect.width+","+rect.height+"<br>";

    if (rect.color == "red" && motorState.checked) {
      var xl = leftpoint.value * aiView.width / 2;
      var yl = aiView.height / 2;
      var xr = aiView.width / 2 + rightpoint.value * aiView.width / 2;
      var yr = aiView.height / 2;
      var xls = -1;
      var xrs = -1;
      if (xl < rect.x)
        var xls = 0;
      else if (xl >= rect.x && xl <= (rect.x + rect.width))
        var xls = 1;
      else if (xl > (rect.x + rect.width))
        var xls = 2;

      if (xr < rect.x)
        var xrs = 0;
      else if (xr >= rect.x && xr <= (rect.x + rect.width))
        var xrs = 1;
      else if (xr > (rect.x + rect.width))
        var xrs = 2;

      var position = "";
      if (xls == 0 && xrs == 0) {
        result.innerHTML = "kiri jauh";
        position = "leftfar";
      } else if (xls == 0 && xrs == 2) {
        result.innerHTML = "normal";
        position = "normal";
      } else if (xls == 0 && xrs == 1) {
        result.innerHTML = "kiri";
        position = "left";
      } else if (xls == 1 && xrs == 1) {
        result.innerHTML = "normal";
        position = "normal";
      } else if (xls == 1 && xrs == 2) {
        result.innerHTML = "kanan";
        position = "right";
      } else if (xls == 2 && xrs == 2) {
        result.innerHTML = "kanan jauh";
        position = "rightfar";
      } else {
        result.innerHTML = "-";
        position = "";
      }

      context.font = '30px Helvetica';
      context.fillStyle = "#fff";
      context.fillText(result.innerHTML, 0, 30);

      var delay = 0;
      if (position.indexOf("right") != -1) {
        if (position == "right") { //titik tengah objek kiri
          delay = turnDelayMin.value;
        } else { //titik objek jauh dari kiri
          delay = turnDelayMax.value;
        }
        if (!hmirror.checked) { ///posisi spion kiri dan kanan berlawanan
          car('/control?car=6;' + delay); //maju ke kiri
          lastDirection = "left";
        } else {
          car('/control?car=7;' + delay); //maju ke kanan
          lastDirection = "right";
        }
      } else if (position.indexOf("left") != -1) {
        if (position == "left") { //titik objek ke kanan
          delay = turnDelayMin.value;
        } else { //titip objek jauh dari kanan
          delay = turnDelayMax.value;
        }
        if (!hmirror.checked) { //posisi spion kiri dan kanan berlawanan
          car('/control?car=7;' + delay); //maju kek kanan
          lastDirection = "right";
        } else {
          car('/control?car=6;' + delay); //maju ke kiri
          lastDirection = "left";
        }
      } else if (position == "normal") { //maju jika berada di garis
        car('/control?car=1;' + forwardDelay.value);
      }
      return;
    }

  });

  if (event.data.length == 0 && motorState
    .checked
  ) { //jika tidak ada garis terdeteksi maka akan berputar ke arah sebaliknya sesuai dengan arah sebelumnya。
    if (lastDirection = "right")
      car('/control?car=6;' + turnDelayMin.value);
    else if (lastDirection = "left")
      car('/control?car=7;' + turnDelayMin.value);
  }

  try {
    document.createEvent("TouchEvent");
    setTimeout(function () {
      aiStill.click();
    }, 250);
  } catch (e) {
    setTimeout(function () {
      aiStill.click();
    }, 150);
  }
});