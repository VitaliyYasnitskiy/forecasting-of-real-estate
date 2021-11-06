let dateNow = new Date();
let defaultValues = {
  'city': 2, // Пермь
  'year': dateNow.getFullYear(),
  'season': Math.floor(dateNow.getMonth() / 3) + 1,
};

let placeholdersForCity = {
  1: {
    'newHouses': 2391.1,
    'mortgage': 89816,
  },
  2: {
    'newHouses': 1112.929,
    'mortgage': 48905,
  },
  3: {
    'newHouses': 2675.5,
    'mortgage': 86231,
  },
  4: {
    'newHouses': 1756.5,
    'mortgage': 67420,
  },
  5: {
    'newHouses': 1464.2,
    'mortgage': 56536,
  },
  6: {
    'newHouses': 5024.8,
    'mortgage': 389842,
  },
  7: {
    'newHouses': 3471.2,
    'mortgage': 193359,
  },
}

let cityCoords = [
  [56.85, 60.61], // ekat
  [58.01, 56.25], // perm
  [55.79, 49.12], // kazan
  [55.04, 82.93], // novosib
  [55.15, 61.43], // chelab
  [55.76, 37.64], // moscow
  [59.94, 30.31], // piter
  [56.326887, 44.005986], // nizhn
  [44.039770, 43.070804], // pyatig
  [47.222531, 39.718705], // rostov
  [48.472584, 135.057732], // habarovsk
  [53.194546, 45.019529], // penza
];

let placeholders = {
  'dollarRate': '63.62',
  'brentRate': '3530.2738',
  'GNP': '109361.5',
  'newHouses': '1112.929',
  'mortgage': '48905',
};

function setDefaultValues(defaultValues) {
  for (let key in defaultValues) {
    if (defaultValues.hasOwnProperty(key))
      $('#' + key).val(defaultValues[key]);
  }
}

function setPlaceholders(placeholders) {
  for (let key in placeholders) {
    if (placeholders.hasOwnProperty(key))
      $('#' + key).attr('placeholder', placeholders[key]);
  }
}

setDefaultValues(defaultValues);
setPlaceholders(placeholders);

function setValueFromPlaceholder() {
  $('#form').find('input').each(function () {
    let t = $(this);
    let placeholderVal = t.attr('placeholder');
    if (t.val().length === 0 && placeholderVal !== undefined) {
      t.val(placeholderVal);
    }
  });
}

function calc() {
  setValueFromPlaceholder();
  let $form = $('#form');
  if ($form.get(0).reportValidity()) {
    $.ajax({
      method: 'post',
      url: 'calc.php',
      data: $form.serialize(),
      success: function (res) {
        document.getElementById("valueWrapper").style.display = 'block';
        document.getElementById("calcValue").innerText = res;
      },
      error: function () {
        alert('Что-то пошло не так, перезагрузите страницу');
      }
    });
  }
}

document.getElementById('calcButton').addEventListener('click', function () {
  calc();
});

$(document).ready(function () {
  $('#year').val((new Date()).getFullYear());
});

ymaps.ready(init);

function init() {
  // Создание карты.
  let myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 11,
    controls: []
  });

  $('#getCoords').click(function () {
    let address = encodeURI($("#city option:selected").text() + ',' + $('#address').val());
    let url = 'https://geocode-maps.yandex.ru/1.x?geocode=' + address + '&a' + 'p' + 'ik' + 'ey=5c10' + '8f36-33' + '45-4799-9239-732d3' + '482395e&format=json';
    $.get(url, function (res) {
      let lngLat = res.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
      $('#lon').val(lngLat[0]);
      $('#lat').val(lngLat[1]);

      setNewPoint(lngLat.reverse());
    });
  });

  function changeCity(cityId) {
    myMap.setCenter(cityCoords[cityId - 1], 11);
  }

  function setNewPlaceholdersForNewCity(cityId) {
    Object.keys(placeholdersForCity[cityId]).forEach((key) => {
      $('#' + key).val('').attr('placeholder', placeholdersForCity[cityId][key]);
    });
  }

  let myGeoObject = null;

  function setNewPoint(coords) {
    if (!myGeoObject) {
      myGeoObject = new ymaps.GeoObject({
        // Описание геометрии.
        geometry: {
          type: "Point",
          coordinates: coords
        },
        // Свойства.
        properties: {
          // Контент метки.
          iconContent: 'Выбранный дом',
        }
      }, {
        preset: 'islands#redDotIcon',
      });

      myMap.geoObjects.add(myGeoObject);
    }

    window.aa = myGeoObject;

    myGeoObject.geometry.setCoordinates(coords);

    myMap.setCenter(coords, 17);
  }

  $('#city').change(function () {
    $('#valueWrapper').hide();
    let cityId = parseInt($(this).val());
    changeCity(cityId);
    setNewPlaceholdersForNewCity(cityId);
  }).change();
}