function loadScores() {
    fetch('https://demo-io.herokuapp.com/leaderboard', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        var element = document.getElementById('lb_table');
        result.sort((a, b) => a.score > b.score ? -1 : 1);
        var data = `<tbody style="font-size: larger;">`;
        for(var i = 0; i < result.length; i++){
            data += `<tr><th scope="row">${i + 1}</th><td>${result[i].name}</td><td>${result[i].score}</td><td>${result[i].deaths == 0 ? 0.00: (result[i].kills / result[i].deaths).toFixed(3)}</td><td>${(result[i].acc * 100).toFixed(3)}</td></tr>`;
        }
        element.innerHTML = element.innerHTML + data + `</tbody>`;
    })
    .catch(error => {
        console.error('Error:', error)
    });
}