import { message } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useUser () {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
  }, []);

  function getUser () {
    const user = localStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
    return user;
  }
  function saveUser (user) {
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }
  function getId () {
    const id = localStorage.getItem('id');
    return id;
  }
  function saveId (id) {
    localStorage.setItem('id', id);
  }
  function saveToken (token) {
    localStorage.setItem('user_token', token);
  }

  function logout () {
    localStorage.removeItem('user');
    localStorage.removeItem('user_token');
    setUser(null);
    message.success('logout success', 0.5, () => {
      location.href = '/RecommendedRecipe';
    });
  }

  return {
    user,
    saveId,
    getId,
    getUser,
    saveUser,
    saveToken,
    logout,
  };
}
