from flask import Flask, render_template
import os

# Flask ilovasini yaratamiz
app = Flask(__name__)

# Asosiy sahifa (Login va Chat sahifasi)
@app.route('/')
def index():
    # templates/index.html faylini foydalanuvchiga yuboradi
    return render_template('index.html')

# Admin Monitoring sahifasi (mystrao uchun)
@app.route('/admin-monitor')
def admin_monitor():
    # Kelajakda bu yerda foydalanuvchilarni kuzatish sahifasini ochamiz
    return "Admin Monitoring sahifasi (Tez kunda...)"

if __name__ == "__main__":
    # Render.com portni avtomatik beradi, bo'lmasa 5000 portda ishlaydi
    port = int(os.environ.get("PORT", 5000))
    
    # Serverni ishga tushirish
    # host='0.0.0.0' - barcha tarmoqlar uchun ochiqligini bildiradi
    app.run(host='0.0.0.0', port=port)
