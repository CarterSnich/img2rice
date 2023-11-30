from flask import Flask, render_template, request, send_file
from ImageGoNord import GoNord
from datetime import datetime
from os import path, listdir
from base64 import b64encode
from json import loads as jsonLoad
from io import BytesIO

app = Flask(__name__)

PALETTES_DIR='palettes'

@app.route("/")
def root():
    return render_template('index.html', year=datetime.now().year)


@app.route('/get-palettes')
def get_palettes():
    palette_folder = path.join(app.static_folder, PALETTES_DIR)
    palletes = {}
    for f in listdir(palette_folder):
        with open(path.join(palette_folder, f), 'r') as p:
            palletes[f] = p.read().splitlines()
    return palletes

@app.route('/convert', methods=['POST'])
def convert_image():
    converter = GoNord()
    converter.reset_palette()

    imageInput = request.files['imageInput']
    colorPalette = jsonLoad(request.form['colorPalette'])

    filename = imageInput.filename
    mimetype = imageInput.mimetype
    fileFormat = mimetype.split('/')[-1]

    image64 = b64encode(imageInput.read())
    pillowImage = converter.base64_to_image(image64)

    for pal in colorPalette:
        converter.add_color_to_palette(pal)

    convertedImage = converter.convert_image(pillowImage)
    
    # convert image to binary
    imageBytes = BytesIO()
    convertedImage.save(imageBytes, format=fileFormat)
    imageBytes = imageBytes.getvalue()

    dl = BytesIO(imageBytes)

    return send_file(dl, mimetype=mimetype, as_attachment=True, download_name=filename)



