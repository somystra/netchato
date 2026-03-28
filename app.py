import os
from flask import Flask, render_template, send_from_directory, jsonify, make_response
from flask_cors import CORS

app = Flask(__name__, static_folder='static', template_folder='templates')

# Xavfsizlik va xalqaro ulanishlar uchun (CORS)
CORS(app)

# --- KONFIGURATSIYA ---
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'netglobal_secret_2026')
app.config['JSON_AS_ASCII'] = False # O'zbek tili harflari uchun

# --- ASOSIY SAHIFA ---
@app.route('/')
def index():
    """
    Asosiy interfeysni yuklash. 
    Bu yerda biz Windows 11 va MagicOS interfeysini render qilamiz.
    """
    response = make_response(render_template('index.html'))
    # Brauzer keshini boshqarish (tezroq yuklanishi uchun)
    response.headers['Cache-Control'] = 'public, max-age=300'
    return response

# --- QIDIRUV VA API (KELAJAK UCHUN) ---
@app.route('/api/status', methods=['GET'])
def get_status():
    """Tizim holatini tekshirish uchun API"""
    return jsonify({
        "status": "online",
        "system": "NetGlobal OS",
        "version": "6.0.1",
        "author": "NetGlobal Team"
    })

# --- XATOLIKLARNI BOSHQARISH (Custom Error Pages) ---
@app.errorhandler(404)
def page_not_found(e):
    # Windows 11 "Blue Screen" yoki MagicOS uslubidagi xato sahifasi
    return render_template('index.html', error_type=404), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Serverda ichki xatolik yuz berdi"}), 500

# --- STATIC FILES (Favicon va h.k.) ---
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

# --- DASTURNI ISHGA TUSHIRISH ---
if __name__ == '__main__':
    # Mahalliy test qilish uchun
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
