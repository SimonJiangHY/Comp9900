import { MiddleContainer, FullScreenContainer3 } from '../styled';
import { Card, List, Popconfirm, Space, message } from 'antd'
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useMemo } from 'react';
import { getToken } from '../utils';
import request from '../utils/request';
import useUser from '../hooks/useUser';
const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export default function Favorites () {
  const { Meta } = Card;
  const { saveUser, saveToken, getId } = useUser();
  const [favList, setFavList] = useState([]);
  // interaction
  useEffect(() => {
    const token = getToken();
    const id = getId();
    if (!token) return;
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/favourite/user/' + id + '?page=1&pagesize=10'
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
      },
    }).then(res => res.json())
      .then(data => {
        if (data.message) {
          if (data.message.not_liked) {
            console.log(data.message)
            if (data.message.not_liked.includes('this user has not liked any recipe')) {
              console.log('nope')
            }
          // console.log('recipes list', recipesList);
          }
        } else {
          setFavList(data.likes)
        }
      });
  }, []);

  function DeleteFav (recipeId) {
    const token = getToken();
    const id = getId();
    request(`/favourite/unlike/${recipeId}`, {
      method: 'GET',
    }).then((response) => {
      response && message.success('Recipe delete success', 0.5, () => {
        // eslint-disable-next-line prefer-const
        let url = 'http://127.0.0.1:5000/favourite/unlike/' + recipeId
        fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token || getToken()}`,
          },
        })
        // eslint-disable-next-line prefer-const
        let suburl = 'http://127.0.0.1:5000/favourite/user/' + id + '?page=1&pagesize=10'
        fetch(suburl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token || getToken()}`,
          },
        }).then(res => res.json())
          .then(data => {
            setTimeout(() => {
              if (data.message) {
                if (data.message.not_liked) {
                  console.log(data.message)
                  if (data.message.not_liked.includes('this user has not liked any recipe')) {
                    console.log('nope')
                    setFavList([])
                  }
                // console.log('recipes list', recipesList);
                }
              } else {
                setFavList(data.likes)
              }
            });
          })
      });
    });
  }

  const Favlistdata = useMemo(() => {
    return favList.map(fav => ({
      ...fav,
      title: fav.recipe_name,
      href: fav.url,
      contributorsName: '',
      content: '',
      id: fav.recipe_id,
      like: fav.likes,
      comments: fav.comments,
      avatar: 'http://127.0.0.1:5000/' + fav.photo
    }));
  }, [favList]);
  return (
    <FullScreenContainer3>
      <MiddleContainer>
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
            pageSize: 9,
            style: { textAlign: 'center' },
          }}
          header={<div style={{ fontSize: '30px', paddingLeft: '30px' }}>Favorites</div>}
          dataSource={Favlistdata}
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
                actions={[
                  // <FavoritesButton key="list-vertical-message"/>,
                  <Popconfirm
                    title="Are you sure to remove this recipe?"
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    onConfirm={() => DeleteFav(item.id)}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                    key="list-vertical-delete-o"
                  >
                    <a><IconText icon={DeleteOutlined} text="Remove" /></a>
                  </Popconfirm>,
                ]}
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
    </FullScreenContainer3>
  )
}
