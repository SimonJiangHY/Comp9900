import React from 'react'
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../user-avatar';

export default function LoginState () {
  // check state
  const user = localStorage.getItem('user');
  console.log(location.pathname)

  const navigate = useNavigate();
  function goLoginPage () {
    navigate('/login');
  }
  function creatRecipes () {
    navigate('/CreateRecipe');
  }
  if (user) {
    return (
      <div>
        <UserAvatar />
        <span style = {{ marginLeft: '50px' }}><Button type="primary" onClick={creatRecipes}>Create a recipe</Button></span>
      </div>
    )
  } else {
    return (
      <Button type="primary" onClick={goLoginPage}>Log in</Button>
    )
  }
}
