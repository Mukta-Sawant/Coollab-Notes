import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

function Home() {
  const [input, setInput] = useState('');
  const navigate = useNavigate(); 

  const handleJoin = () => {
    if (input.trim()) {
      navigate(`/room/${input.trim()}`);
    }
  };

  const handleCreate = () => {
    const newRoom = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${newRoom}`);
  };

  return (
    <div style={styles.container}>
      <h1>Collaborative Notes 📝</h1>
      <input
        placeholder="Enter Room ID..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={styles.input}
      />
      <button style={styles.button} onClick={handleJoin}>Join Room</button>
      <p>OR</p>
      <button style={styles.button} onClick={handleCreate}>Create New Room</button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '100px',
    backgroundColor: '#121212',
    height: '100vh',
    color: 'white',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid gray',
    width: '250px',
    backgroundColor: '#1e1e1e',
    color: 'white',
  },
  button: {
    margin: '5px',
    padding: '10px 20px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

export default Home;
