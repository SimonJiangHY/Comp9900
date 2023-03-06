import React, { useEffect, useState, useMemo, Button } from 'react'
import { Avatar, List, Space, message } from 'antd';
import { MiddleContainer, FullScreenContainer1 } from '../styled';
import styled from 'styled-components';
import useUser from '../hooks/useUser';
import { getToken } from '../utils';

// inline style
export const Context = styled.div`
  position: relative;
  margin: 0 auto;
  width: 920px;
  height: 150px;
  border: 1px solid #C0C0C0;
  padding: 0px 0px 0px 0px;
`;

export default function Post () {
  const { saveUser, saveToken, getId } = useUser();
  const [recipesList, setRecipesList] = useState([]);
  const id = getId();
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    console.log('recipes list', recipesList);
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/follow/following_recipes?' + 'page=' + 1 + '&pagesize=' + 100
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
        'cache-control': 'no-store'
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
        }
      });
  }, []);
  console.log('recipes list', recipesList);
  const Recipelistdata = useMemo(() => {
    return recipesList.map(recipe => ({
      ...recipe,
      title: recipe.recipe_name,
      href: `/recipe/${recipe.recipe_id}`,
      contributorsName: '',
      content: recipe.description,
      id: recipe.recipe_id,
      like: recipe.likes,
      comments: recipe.comments,
      avatar: 'http://127.0.0.1:5000/' + recipe.author.avatar,
      username: recipe.author.username,
      userid: recipe.author.id,
      userhref: `/OtherPersonalInfor/${recipe.author.id}`,
      recipephoto: 'http://127.0.0.1:5000/' + recipe.photo,
      views: recipe.views,
      email: recipe.author.email,
      time: recipe.last_modified
    }));
  }, [recipesList]);
  return (
    <FullScreenContainer1>
      <MiddleContainer>
        <List
          header={<div style={{ fontSize: '30px', paddingLeft: '30px' }}>Post</div>}
          itemLayout="vertical"
          size="large"
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 5,
            style: { textAlign: 'center' },
          }}
          dataSource={Recipelistdata}
          renderItem={(item) => (
            <List.Item
              key={item.title}
              actions={[
                // <FavoritesButton key="list-vertical-message"/>,
                // <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar size = {50} src={item.avatar} />}
                title={<a href={item.userhref}>{item.username}</a>}
                description={item.email}
              />
              <Context style={{ cursor: 'pointer' }} onClick={() => { location.href = item.href; }}>
                <img
                  style = {{ float: 'left' }}
                  height={148}
                  width={170}
                  alt="logo"
                  src= {item.recipephoto}
                />
                <span style = {{ position: 'relative', width: '200px' }}>
                  <div style = {{ fontSize: '20px', padding: '10px 0px 0px 180px' }}>
                    {item.recipe_name}
                  </div>
                  <div style = {{ padding: '0px 0px 0px 12px', width: '740px', height: '68px', 'text-overflow': 'ellipsis', overflow: 'hidden' }}>
                    {item.content}
                  </div>
                  <div style = {{ padding: '20px 0px 0px 730px' }}>
                    Post Time : {item.time}
                  </div>
                </span>
              </Context>
              {/* {item.content} */}
            </List.Item>
          )}
        />
      </MiddleContainer>
    </FullScreenContainer1>
  )
}
