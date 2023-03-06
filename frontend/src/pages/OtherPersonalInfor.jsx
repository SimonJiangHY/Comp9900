import { MiddleContainer, FullScreenContainer2 } from '../styled';
import { Avatar, Card, List, message, Button } from 'antd'
import React, { useState, useEffect, useMemo, useContext, createContext } from 'react';
import { useParams } from 'react-router-dom';
import request from '../utils/request';
import { getToken } from '../utils';

// test sample
const userdata = {
  Name: 'jax',
  Email:
    '123456@qq.com',
};
const C = createContext();
function FollowComponent () {
  // get user id
  const [userId] = useContext(C)
  const id = userId
  // ////////////////////////////
  const [isfollowState, setfollowState] = useState('')
  const [count, setCount] = useState(0)
  const [finish, setFinish] = useState(0)
  const [follow, cancle] = useState('')
  useEffect(() => {
    if (id !== null) {
      request('/users/' + id, {
        method: 'get',
      }).then(data => {
        setfollowState(data.is_following);
      });
    }
  }, [count, finish])
  // Judge the follow state
  useEffect(() => {
    if (isfollowState === 'cur_user') {
      cancle('edit');
    } else {
      cancle(isfollowState === false ? 'Follow' : 'Unfollow');
    }
  }, [isfollowState, count])
  const clickFollow = () => {
    if (isfollowState === 'cur_user') {
      location.href = '/personalInforM';
    } else {
      setCount(count + 1);
    }
  }
  // interaction
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    if (count === 0) return;
    if (isfollowState === 'cur_user') return;
    // eslint-disable-next-line prefer-const
    let urlsubscribe = 'http://127.0.0.1:5000/follow/subscribe/' + id
    const urlunsubscribe = 'http://127.0.0.1:5000/follow/unsubscribe/' + id
    if (isfollowState) {
      fetch(urlunsubscribe, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token || getToken()}`,
        },
      }).then(res => res.json())
        .then(data => {
          setFinish(finish + 1);
        });
    } else {
      fetch(urlsubscribe, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token || getToken()}`,
        },
      }).then(res => res.json())
        .then(data => {
          console.log(data)
          if (data.message) {
            if (data.message.includes('you can\'t subscribe yourself')) {
              message.error('you can\'t subscribe yourself');
            } else {
              setFinish(finish + 1);
            }
          }
        });
    }
  }, [count])
  return (
    <span style = {{ paddingTop: '30px' }}>
      {/* <Avatar onClick={() => { location.href = '/personalInfor'; }} size = {80} src={avatar} /> */}
      <div style = {{ paddingTop: '20px' }}>
        <Button type="primary" style = {{ fontSize: '15px' }} onClick = { clickFollow } > {follow} </Button>
      </div>
    </span>
  )
}

export default function OtherPersonalInfor () {
  const { userId } = useParams()
  const { Meta } = Card;
  const [username, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [name, setName1] = useState('')
  const [gender, setGender] = useState('')

  const [recipesList, setRecipesList] = useState([]);
  const token = getToken();
  if (!token) {
    location.href = '/login'
  }
  useEffect(() => {
    request('/users/' + userId, {
      method: 'get',
    }).then(data => {
      setAvatar('http://127.0.0.1:5000/' + data.avatar);
      setName(data.username);
      setEmail(data.email);
      setIntroduction(data.introduction);
      setName1(data.name);
      setGender(data.gender);
      console.log(data);
    });
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/recipes/user' + '?id=' + userId + '&page=' + 1 + '&pagesize=' + 10
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }).then(res => res.json())
      .then(data => {
        if (data.message) {
          if (data.message.includes('no content this page')) {
            message.error('no data');
          }
        // console.log('recipes list', recipesList);
        } else {
          setRecipesList(data.recipes)
          console.log(recipesList)
        }
      });
  }, [])

  const Recipelistdata = useMemo(() => {
    return recipesList.map(recipe => ({
      ...recipe,
      title: recipe.recipe_name,
      href: `/recipe?recipeId=${recipe.recipe_id}`,
      contributorsName: '',
      content: '',
      id: recipe.recipe_id,
      like: recipe.likes,
      comments: recipe.comments,
      avatar: 'http://127.0.0.1:5000/' + recipe.photo
    }));
  }, [recipesList]);
  return (
    <FullScreenContainer2>
      <MiddleContainer>
        <Card
          style={{ width: 920, marginTop: 10 }}
        >
          <div style = {{ position: 'absolute', width: 400, height: 150, top: 20, right: 50 }}>
          <List
            size="large"
          >
            <List.Item>Email: {email}</List.Item>
            <List.Item>Name: {name}</List.Item>
            <List.Item>Gender: {gender}</List.Item>
          </List>
          </div>
          <Meta
            style = {{ width: '50%' }}
            avatar={<Avatar size = {100} src={avatar}/>}
            title={<p style = {{ paddingLeft: '30px', fontSize: '40px', margin: '0 auto' }} > {username} </p>}
            description={<p style = {{ paddingLeft: '30px', fontSize: '20px', margin: '0 auto', display: 'inline' }} >{introduction}</p>}
          />
          <C.Provider value={[userId]} >
            <div style = {{ paddingLeft: '15px' }} >
              <FollowComponent />
            </div>
          </C.Provider>
        </Card>
        <List
          style={{ paddingRight: 20 }}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3,
            xxl: 3,
          }}
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 6,
            style: { textAlign: 'center' },
          }}
          header={<div style={{ fontSize: '30px', paddingLeft: '30px' }}>His/Her recipes</div>}
          dataSource={Recipelistdata}
          renderItem={item => (
            <List.Item>
              <Card
                style={{ width: 300 }}
                cover={
                  <img
                    alt="example"
                    src={item.avatar}
                    onClick={() => { location.href = '/Recipe/' + item.id; }}
                  />
                }
              >
                <Meta
                  title={item.title}
                  description={item.description}
                />
              </Card>
            </List.Item>
          )}
        />
      </MiddleContainer>
    </FullScreenContainer2>
  )
}
