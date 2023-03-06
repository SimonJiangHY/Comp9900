import React, { useEffect, useState, useMemo, } from 'react';
import { List, Space, Popconfirm, message } from 'antd';
import { DeleteTwoTone, HeartOutlined, EditTwoTone, MessageOutlined, QuestionCircleOutlined, EyeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import request from '../utils/request';
import { getToken } from '../utils';
import useUser from '../hooks/useUser';

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

// inline style
export const FullScreenContainer4 = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  background-color: #f2f2f2;
`;

const Container = styled.div`
  margin: auto auto;
  padding: 10px 20x;
  background-color: #fff;
  position: relative;
  width: 1000px;
  max-width: 1200px;
`;

export default function OwnRecipies () {
  const { getId } = useUser();
  const [recipesList, setRecipesList] = useState([]);
  const id = getId();
  // interaction
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    console.log('recipes list', recipesList);
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/recipes/user' + '?id=' + id + '&page=' + 1 + '&pagesize=' + 100
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

  function DeleteRecipes (recipeId) {
    request(`/recipes/${recipeId}`, {
      method: 'delete',
    }).then((response) => {
      const token = getToken();
      response && message.success('Recipe delete success', 0.5, () => {
        // eslint-disable-next-line prefer-const
        let url = 'http://127.0.0.1:5000/recipes/user' + '?id=' + id + '&page=' + 1 + '&pagesize=' + 100
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
                setRecipesList([])
              }
            } else {
              setRecipesList(data.recipes)
            }

            console.log('recipes list', recipesList);
          });
      });
    });
  }

  const Recipelistdata = useMemo(() => {
    return recipesList.map(recipe => ({
      ...recipe,
      title: recipe.recipe_name,
      href: `/recipe/${recipe.recipe_id}`,
      contributorsName: '',
      content: '',
      id: recipe.recipe_id,
      like: recipe.likes,
      comments: recipe.comments,
      avatar: 'http://127.0.0.1:5000/' + recipe.photo,
      views: recipe.views
    }));
  }, [recipesList]);

  return (
    <FullScreenContainer4>
    <Container>
      <List
    itemLayout="vertical"
    size="large"
    pagination={{
      onChange: page => {
        console.log(page);
      },
      pageSize: 10,
    }}
    dataSource={Recipelistdata}
    footer={
      <div>
        <b>Your own published recipes</b>
      </div>
    }
    renderItem={item => (
      <List.Item
        key={item.id}
        actions={[
          <IconText icon={EyeOutlined} text={item.views} key="list-vertical-message" />,
          <IconText icon={HeartOutlined} text={item.likes} key="list-vertical-like-o" />,
          <IconText icon={MessageOutlined} text={item.comments} key="list-vertical-message" />,
          <Popconfirm
            title="Are you sure to edit this recipe?"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => { location.href = '/UpdateRecipe/' + item.id; }}
            onCancel={() => {}}
            okText="Yes"
            cancelText="No"
            key="list-vertical-delete-o"
          >
            <a><IconText icon={EditTwoTone} text="Edit" /></a>
          </Popconfirm>,
          <Popconfirm
          title="Are you sure to delete this recipe?"
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          onConfirm={() => DeleteRecipes(item.id)}
          onCancel={() => {}}
          okText="Yes"
          cancelText="No"
          key="list-vertical-delete-o"
          >
            <a><IconText icon={DeleteTwoTone} text="Delete" /></a>
          </Popconfirm>,
        ]}
        extra={
          <img
            width={'150px'}
            height={'150px'}
            alt="logo"
            src={item.avatar}
          />
        }
      >
        <List.Item.Meta
          title={<a href={item.href}>{item.title}</a>}
          description={item.contributorsName}
        />
        {item.content}
      </List.Item>
    )}
    />
    </Container>
    </FullScreenContainer4>
  )
}
