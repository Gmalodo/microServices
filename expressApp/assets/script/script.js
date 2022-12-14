const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d")
ctx.fillStyle = "#FF0000";
canvas.width = 1000
canvas.height = 700

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then((video) => {
    const track = video.getVideoTracks()[0]
    post(track)
})
const h2 = document.createElement('h2')
document.body.appendChild(h2)
function post (track) {
    let imageCapture = new ImageCapture(track)
    imageCapture.takePhoto().then((image) => {
        let form_data = new FormData()
        // form_data.append('operations', `{
        //       "query": "query($file: Upload!, $name: String) { addRecognizablePerson(image: $file, name: $name) }",
        //       "variables": {
        //         "file": ${image},
        //         "name": "remi3"
        //       }
        //     }`)

        let headers = new Headers();

        headers.append('Content-Type', 'multipart/form-data');
        // headers.append('Accept', 'application/json');
        headers.append('Origins','http://localhost:3001');
        headers.append('Access-Control-Allow-Origin','*');
        headers.append('Access-Control-Allow-Headers','*');
        headers.append('Apollo-Require-Preflight','true');

        form_data.append("operations", JSON.stringify({query: `query ($image: Upload!) { face(image: $file) { names landmarks } }`, variables: {file: null}}))
        console.log(JSON.stringify({query: `query ($image: Upload!) { face(image: $file) { names landmarks } }`, variables: {file: null}}))
        // form_data.append('variable', '{query($file: Upload!, $name: String) {addRecognizablePerson(image: $file, name: $name)}}')
        // form_data.append('file', )

        form_data.append('map', {"0":["variables.file"]})
        form_data.append("0", image);

/* headers: { 'X-Apollo-Operation-Name': 'name', 'Apollo-Require-Preflight': "true", "Some-Special-Header": true}*/
        fetch("http://localhost:5000/graphql", {method: "POST", headers: headers, body: form_data}).then(data => {
            post(track)
            data.json().then(json => {
                if (json.landmarks["personne inconnue"] !== null) {
                    ctx.reset()
                    let f = ""
                    json.names.forEach(name => {
                         f = f + ' ' + name.split('.')[0]
                        Object.values(json.landmarks[name]).forEach(values => {
                            values.forEach(XY => {
                                ctx.fillRect(XY[0], XY[1], 2, 2);
                            })
                        })
                    })
                    h2.innerHTML = f
                }
            })
        })
    })
}
