import React, { useEffect, useState, useMemo } from 'react';
import { MiddleContainer, FullScreenContainer3 } from '../styled';
import { Radio, List, Avatar, Space, message, Divider } from 'antd';
import { FireOutlined } from '@ant-design/icons';

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export default function Rank () {
  const [recipesList, setRecipesList] = useState([]);
  const [TimetypeList, setTimetypeList] = useState('within_today');
  const [p, setP] = useState([]);
  const onChange = (e) => {
    setTimetypeList(e.target.value);
    console.log(`radio checked:${e.target.value}`);
  };
  console.log('TimetypeList = ', TimetypeList);
  let urlTime = 'time='
  if (TimetypeList === undefined) {
    urlTime = ''
  } else {
    urlTime += TimetypeList
  }
  console.log('urlTime = ', urlTime);
  // interaction
  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let urlp = 'http://127.0.0.1:5000/ranking/popular'
    console.log('ssssssssss');
    fetch(urlp, {
      method: 'PATCH',
    })
  },);
  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/ranking/franking?' + 'page=' + 1 + '&pagesize=' + 10 + '&' + urlTime
    console.log('get', p);
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
            setRecipesList([])
          }
        // console.log('recipes list', recipesList);
        } else {
          setRecipesList(data.recipes)
          setP(data.recipes.popular)
        }
      });
  }, [TimetypeList, p]);

  const Recipelistdata = useMemo(() => {
    return recipesList.map(recipe => ({
      ...recipe,
      title: recipe.recipe_name,
      href: `/Recipe/${recipe.recipe_id}`,
      contributorsName: recipe.author.username,
      content: '',
      id: recipe.recipe_id,
      like: recipe.likes,
      comments: recipe.comments,
      avatar: 'http://127.0.0.1:5000/' + recipe.photo,
      popular: recipe.popular
    }));
  }, [recipesList]);

  return (
    <FullScreenContainer3>
      <MiddleContainer>
          <>
          <Space style = {{ fontSize: 20, paddingTop: '10px' }}>
            Select Time
          </Space>
          <Divider />
          <Space size={'large'}>
            Time:
            <Radio.Group onChange={onChange} defaultValue="within_today">
              <Radio.Button value="within_today">within_today</Radio.Button>
              <Radio.Button value="within_1_week">within_1_week</Radio.Button>
              <Radio.Button value="within_1_month">within_1_month</Radio.Button>
            </Radio.Group>
          </Space>
          <Divider />
        </>
        <h1>Recipe Likes List</h1>
        <List
          dataSource={Recipelistdata}
          renderItem={item => (
            <List.Item
            actions={[
              <IconText icon={FireOutlined} text={item.popular} key="list-vertical-message" />,
            ]}
            >
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={<a href={item.href}>{item.title}</a>}
              name={<a href="https://ant.design">{item.contributorsName}</a>}
              description={item.contributorsName}
            />
            </List.Item>
          )}
        />
      </MiddleContainer>
    </FullScreenContainer3>
  )
}
