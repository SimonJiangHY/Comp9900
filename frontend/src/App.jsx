import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import styled from 'styled-components';
import Home from './pages/home';
import PersonalInforM from './pages/PersonalInforM';
import CreateRecipe from './pages/CreateRecipe';
import UpdateRecipe from './pages/UpdateRecipe';
import FollowList from './pages/FollowList';
import Favorites from './pages/Favorites';
import Login from './pages/login';
import Register from './pages/register';
import Recipe from './pages/Recipe';
import NavActions from './components/nav-actions';
import OwnRecipes from './pages/ownRecipes';
import Post from './pages/Post';
import Rank from './pages/Rank';
import OtherPersonalInfor from './pages/OtherPersonalInfor';
import RecipeList from './pages/RecipeList';
import logo from './logo.jpeg';
import './App.css';

const { Header, Content } = Layout;

// logo
const logoStyle = {
  position: 'absolute',
  width: '40px',
  height: '40px',
  left: '10px',
  top: '12px',
};

// style
const LogoTitle = styled.h1`
  position: absolute;
  left: 60px;
`;

function App () {
  return (
    <div className='app-container'>
      <Layout style={{ height: '100%' }}>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%', background: '#fff', padding: '0 160px' }}>
          <img style={logoStyle} src={logo} />
          <LogoTitle>Cooking</LogoTitle>
          <Menu mode="horizontal" selectedKeys={[location.pathname]}>
            <Menu.Item key="/">
              <a href="/">
                Home
              </a>
            </Menu.Item>
            <Menu.Item key="/Recipes">
              <a href="/RecipeList">
                Recipes
              </a>
            </Menu.Item>
            <Menu.Item key="/Rank">
            <a href="/Rank">
                Rank
              </a>
            </Menu.Item>
          </Menu>
          <NavActions />
        </Header>
        <Content className="site-layout" style={{ marginTop: 64 }}>
          <div className="site-layout-background" style={{ height: 'calc(100vh - 64px)' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="PersonalInforM" element={<PersonalInforM />} />
              <Route path="CreateRecipe" element={<CreateRecipe />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="FollowList/*" element={<FollowList />} />
              <Route path="ownRecipes" element={<OwnRecipes />} />
              <Route path="Favorites" element={<Favorites />} />
              <Route path="Post" element={<Post />} />
              <Route path="OtherPersonalInfor/:userId" element={<OtherPersonalInfor />} />
              <Route path="UpdateRecipe/:recipeId" element={<UpdateRecipe />} />
              <Route path="Recipe/:recipeId" element={<Recipe />} />
              <Route path="RecipeList/:text" element={<RecipeList />} />
              <Route path="RecipeList" element={<RecipeList />} />
              <Route path="Rank" element={<Rank />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
