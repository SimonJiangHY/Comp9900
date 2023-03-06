import { React, useEffect, useState } from 'react';
import { Menu, Dropdown, Avatar, message, Space } from 'antd';
import { BookOutlined, BellOutlined, StarOutlined, LogoutOutlined } from '@ant-design/icons';
import request from '../../utils/request';
import useUser from '../../hooks/useUser';
import { UserContainer } from '../../styled';

// test sample
const menu = (
  <Menu>
    <Menu.Item key="0">
      <a onClick={() => { location.href = '/personalInfor'; }}>Personal information</a>
    </Menu.Item>
    <Menu.Item key="1">
      <a onClick={() => { location.href = '/'; }}>Post</a>
    </Menu.Item>
    <Menu.Item key="2">
      <a onClick={() => { location.href = '/'; }}>Favorites</a>
    </Menu.Item>
    <Menu.Item key="3">
      <a onClick={() => { location.href = '/ownRecipes'; }}>Own Recipes</a>
    </Menu.Item>
    <Menu.Item key="4">
      <a onClick={() => { location.href = '/CreateRecipe'; }}>Create a New Recipes</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="exit" onClick={() => {
      localStorage.removeItem('user');
      localStorage.removeItem('user_token');
      localStorage.removeItem('id');
      message.success('exit success', 1, () => {
        location.href = '/login';
      });
    }}>Exit</Menu.Item>
  </Menu>
);
export default function UserAvatar () {
  const { getId } = useUser();
  const id = getId();
  const [avatar, setAvatar] = useState('')
  const [followingnum, setFollowing] = useState('')
  const [followernum, setFollower] = useState('')
  const [favouritenum, setFavourite] = useState('')
  useEffect(() => {
    if (id !== null) {
      request('/users/' + id, {
        method: 'get',
      }).then(data => {
        setAvatar('http://127.0.0.1:5000/' + data.avatar);
        setFollowing(data.following_num);
        setFollower(data.follower_num);
        setFavourite(data.favourite_num);
      });
    }
  })
  const test = (
    <UserContainer>
      <div style = {{ paddingTop: '30px' }}>
        <Avatar onClick={() => { location.href = '/OtherPersonalInfor/' + id; }} size = {80} src={avatar} />
      </div>
      <div style = {{ paddingTop: '50px', clear: 'both' }}>
        <Space align="center" size = 'large'>
          <div>
            <div>
              <a onClick={() => { location.href = '/FollowList/Follow'; }}>{followingnum}</a>
            </div>
            <div>Following</div>
          </div>
          <div style = {{ paddingLeft: '35px' }}>
            <div>
              <a onClick={() => { location.href = '/FollowList/Follower'; }}>{followernum}</a>
            </div>
            <div>Follower</div>
          </div>
        </Space>
      </div>
      <div style = {{ paddingTop: '30px', clear: 'both' }}>
        <Space align="center" size = 'large'>
          <div style = {{ paddingRight: '20px' }}>
            <BookOutlined style={{ fontSize: '30px', color: '#08c' }} onClick={() => { location.href = '/ownRecipes'; }} />
            <div>Own Recipes</div>
          </div>
          <div style = {{ paddingRight: '27px' }}>
            <BellOutlined style={{ fontSize: '30px', color: '#08c' }} onClick={() => { location.href = '/Post'; }} />
            <div>Post</div>
          </div>
          <div style = {{ paddingRight: '10px' }}>
            <StarOutlined style={{ fontSize: '30px', color: '#08c' }} onClick={() => { location.href = '/Favorites'; }} />
            <div>Favorites</div>
          </div>
          {/* <Button type="primary" onClick={() => { location.href = '/ownRecipes'; }}> Own Recipes </Button> */}
        </Space>
      </div>
      <div style = {{ paddingTop: '30px' }}>
        <LogoutOutlined style={{ fontSize: '20px' }} onClick={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('user_token');
          localStorage.removeItem('id');
          message.success('exit success', 1, () => {
            location.href = '/login';
          });
        }}/> Log out
      </div>
    </UserContainer>
  );
  return (
    <Dropdown overlay={test}>
      <a className="ant-dropdown-link" href="#">
        <Avatar src={avatar} />
      </a>
    </Dropdown>
  );
}
