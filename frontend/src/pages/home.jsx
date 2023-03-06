/* eslint-disable no-debugger */
/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo } from 'react';
import { MiddleContainer, FullScreenContainer3 } from '../styled';
import { List, Avatar, Space, message, Card, Col, Row } from 'antd';
import { HeartOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

const { Meta } = Card;

export default function Home () {
  const [recipesList, setRecipesList] = useState([]);
  // interaction
  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/recipes?' + 'page=' + 1 + '&pagesize=' + 100
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
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
      description: recipe.description,
      views: recipe.views,
      avatar: 'http://127.0.0.1:5000/' + recipe.photo,
      img: 'http://127.0.0.1:5000/' + recipe.author.avatar
    }));
  }, [recipesList]);

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
          header={<div style={{ fontSize: '30px', paddingLeft: '30px' }}>Home</div>}
          dataSource={Recipelistdata}
          renderItem={item => (
            <List.Item>
              <Card
                style={{ width: 300 }}
                cover={
                  <img
                    src={item.avatar}
                    // onClick={() => { location.href = '/Recipe'; }}
                    onClick={() => { location.href = '/Recipe/' + item.id; }}
                    alt="" width={'400px'} height={'200px'}
                  />
                }
                actions={[
                  // <LikesButton key="list-vertical-message"/>,
                ]}
              >
                <Meta
                  description={item.description}
                />
                <h1 style={{ fontSize: '15px' }}>{item.title}</h1>
                <Row>
                <Col offset={1}>
                <Avatar size = {30} src={item.img} />
                </Col>
                <Col offset={2}>
                <IconText icon={MessageOutlined} text={item.comments} key="list-vertical-message" />
                </Col>
                <Col offset={2}>
                <IconText icon={HeartOutlined} text={item.like} key="list-vertical-like-o" />
                </Col>
                <Col offset={2}>
                <IconText icon={EyeOutlined} text={item.views} key="list-vertical-message" />
                </Col>
                </Row>
              </Card>
            </List.Item>
          )}
        />
      </MiddleContainer>
    </FullScreenContainer3>
  )
}
