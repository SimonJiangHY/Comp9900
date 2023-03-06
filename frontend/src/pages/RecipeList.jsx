/* eslint-disable no-debugger */
/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MiddleContainer, FullScreenContainer3 } from '../styled';
import { List, Avatar, Space, Button, message, Card, Col, Divider, Row, Checkbox } from 'antd';
import { HeartOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';

const { Meta } = Card;

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export default function RecipeList () {
  const CheckboxGroup = Checkbox.Group;
  const { text } = useParams()
  console.log('text = ', text);
  const MealType = ['Breakfast', 'Lunch', 'Dinner', 'Main', 'Drink', 'Snack'];
  const MainIngredients = ['Beef', 'Vegetable', 'Pasta', 'Poultry', 'Pork', 'Seafood'];
  const Time = ['Under 20 min', 'Under 30 min', 'Under 60 min', 'Over 60 min'];
  const Method = ['American', 'British', 'Chinese', 'Italian', 'Indian', 'French', 'other'];
  const [mealtypeList, setmealtypeList] = useState([]);
  const [mainIngredientsList, setmainIngredientsList] = useState([]);
  const [timeList, settimeList] = useState([]);
  const [methodList, setmethodList] = useState([]);
  const onChange1 = (list) => {
    setmealtypeList(list);
  };
  const onChange2 = (list) => {
    setmainIngredientsList(list);
  };
  const onChange3 = (list) => {
    settimeList(list);
  };
  const onChange4 = (list) => {
    setmethodList(list);
  };
  const onCheckAllChange = (e) => {
    setmealtypeList([]);
    setmainIngredientsList([]);
    settimeList([]);
    setmethodList([]);
  };
  // console.log('mealtypeList = ', mealtypeList);
  // console.log('mainIngredientsList = ', mainIngredientsList);
  // console.log('timeList = ', timeList);
  // console.log('methodList = ', methodList);
  let urlRecipe = 'recipe='
  let urlRecipeChanged = ''
  if (text === undefined) {
    urlRecipeChanged += 'recipe=null'
  } else {
    urlRecipe += text;
    for (let j = 0; j < urlRecipe.length; j++) {
      if (urlRecipe[j] === ',') {
        urlRecipeChanged += '%2C'
      } else {
        urlRecipeChanged += urlRecipe[j]
      }
    }
  }
  console.log('urlRecipeChanged=', urlRecipeChanged);
  let urlType = 'type='
  let urlIngredient = 'ingredient='
  let urlTime = 'time='
  let urlMethod = 'method='
  if (mealtypeList[0] === undefined) {
    urlType += 'null'
  } else {
    urlType += mealtypeList[0]
    for (let i = 1; i < mealtypeList.length; i++) {
      urlType += '%2C' + mealtypeList[i]
    }
  }
  if (mainIngredientsList[0] === undefined) {
    urlIngredient += 'null'
  } else {
    urlIngredient += mainIngredientsList[0]
    for (let i = 1; i < mainIngredientsList.length; i++) {
      urlIngredient += '%2C' + mainIngredientsList[i]
    }
  }
  if (timeList[0] === undefined) {
    urlTime += 'null'
  } else {
    urlTime += timeList[0]
    for (let i = 1; i < timeList.length; i++) {
      urlTime += '%2C' + timeList[i]
    }
  }
  let urlTimeChanged = ''
  for (let j = 0; j < urlTime.length; j++) {
    if (urlTime[j] === ' ') {
      urlTimeChanged += '%20'
    } else {
      urlTimeChanged += urlTime[j]
    }
  }
  if (methodList[0] === undefined) {
    urlMethod += 'null'
  } else {
    urlMethod += methodList[0]
    for (let i = 1; i < methodList.length; i++) {
      urlMethod += '%2C' + methodList[i]
    }
  }
  const [recipesList, setRecipesList] = useState([]);
  // interaction
  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/search?' + urlRecipeChanged + '&' + urlType + '&' + urlIngredient + '&' + urlTimeChanged + '&' + urlMethod + '&page=' + 1 + '&pagesize=' + 100
    console.log('url=', url);
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
        }
      });
  }, [urlType, urlIngredient, urlTime, urlMethod]);

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

  let Header = ''
  if (text !== undefined) {
    Header += 'Result of ' + text + ':'
  }

  return (
    <FullScreenContainer3>
      <MiddleContainer>
        <Space style = {{ fontSize: 20, paddingTop: '10px' }}>
          Select your category
        </Space>
        <Button style = {{ float: 'right' }} type="primary" shape="round" size={'large'} onClick={onCheckAllChange}>
          Clear
        </Button>
        <Divider />
        <Space size={'large'}>
          Meal Type:
          <CheckboxGroup options={MealType} value={mealtypeList} onChange={onChange1} />
        </Space>
        <Divider />
        <Space>
          Main Ingredients:
          <CheckboxGroup options={MainIngredients} value={mainIngredientsList} onChange={onChange2}/>
        </Space>
        <Divider />
        <Space>
          Time:
          <CheckboxGroup options={Time} value={timeList} onChange={onChange3}/>
        </Space>
        <Divider />
        <Space>
          Method:
          <CheckboxGroup options={Method} value={methodList} onChange={onChange4}/>
        </Space>
        <Divider />
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
          header={<div style={{ fontSize: '25px', paddingLeft: '30px' }}>{Header}</div>}
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
                  // title={item.title}
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
