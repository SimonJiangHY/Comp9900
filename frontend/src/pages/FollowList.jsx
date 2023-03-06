import React from 'react'
import { Menu } from 'antd';
import { MiddleContainer } from '../styled';
import { Routes, Route, NavLink } from 'react-router-dom';
import Follow from '../components/follow';
import Follower from '../components/followers';

export default function FollowList () {
  // route connect follow and follower
  return (
    <div style = {{ paddingTop: '80px', paddingLeft: '50px' }}>
      <Menu style={{ width: 256, float: 'left' }}>
        <Menu.Item>
          <NavLink to="/FollowList/Follow">Following</NavLink>
        </Menu.Item>
        <Menu.Item>
          <NavLink to="/FollowList/Follower">Follower</NavLink>
        </Menu.Item>
      </Menu>
      <MiddleContainer>
        <Routes>
          <Route path="Follow" element={ <Follow/> } />
          <Route path="Follower" element={ <Follower/> } />
        </Routes>
      </MiddleContainer>
    </div>
  )
}
