from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO, emit
import os
import json

app = Flask(__name__)
app.secret_key = 'supersecretkey'
socketio = SocketIO(app)

users = []
current_song = {"type": "playlist", "url": "", "index": 0, "playlist": []}

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/party', methods=['POST'])
def party():
    name = request.form.get('name')
    pin = request.form.get('pin')
    if pin == '1234':
        session['name'] = name
        users.append(name)
        return redirect(url_for('party_session'))
    return redirect(url_for('login'))

@app.route('/party_session')
def party_session():
    if 'name' in session:
        return render_template('party.html', users=users, current_song=current_song)
    return redirect(url_for('login'))

@socketio.on('connect')
def handle_connect():
    emit('user_connected', session['name'], broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    if 'name' in session:
        users.remove(session['name'])
        emit('user_disconnected', session['name'], broadcast=True)

@socketio.on('play_song')
def handle_play_song(data):
    global current_song
    current_song = data
    emit('play_song', data, broadcast=True)

@socketio.on('control')
def handle_control(data):
    emit('control', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)
