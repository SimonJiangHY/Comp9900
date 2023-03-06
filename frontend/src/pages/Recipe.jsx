import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { Form, Input, Button, message, Descriptions, Avatar, Space, Comment, Popconfirm, Card, List, Col, Row, Divider, Tooltip } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Icon, { QuestionCircleOutlined, DeleteTwoTone, HeartOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';
import useUser from '../hooks/useUser';
import request from '../utils/request';
import styled from 'styled-components';
import { getToken } from '../utils';

const C = createContext();

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export const FullScreenContainer4 = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  background-color: #fff;
`;

const { TextArea } = Input;

interface CommentItem {
  author: string;
  avatar: string;
  content: React.ReactNode;
  datetime: string;
}

interface EditorProps {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  submitting: boolean;
  value: string;
}

const CommentList = ({ comments }: { comments: CommentItem[] }) => (
  <List
    dataSource={comments}
    header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
    itemLayout="horizontal"
    renderItem={props => <Comment {...props} />}
  />
);

const Editor = ({ onChange, onSubmit, submitting, value }: EditorProps) => (
  <>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Add Comment
      </Button>
    </Form.Item>
  </>
);

// test sample
const data = [
  {
    actions: [<Popconfirm
      title="Are you sure to delete this recipe?"
      icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
      onConfirm={() => {}}
      onCancel={() => {}}
      okText="Yes"
      cancelText="No"
      key="list-vertical-delete-o"
    >
      <a><IconText icon={DeleteTwoTone} text="Delete" /></a>
    </Popconfirm>],
    author: 'Han Solo',
    avatar: 'https://joeschmoe.io/api/v1/random',
    content: (
      <p>
        We supply a series of design principles, practical patterns and high quality design
        resources (Sketch and Axure), to help people create their product prototypes beautifully and
        efficiently.
      </p>
    ),
    // <button></button>
    datetime: (
      <Tooltip title="2016-11-22 11:22:33">
        <span>8 hours ago</span>
      </Tooltip>
    ),
  },
  {
    actions: [<Popconfirm
      title="Are you sure to delete this comment?"
      icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
      onConfirm={() => {}}
      onCancel={() => {}}
      okText="Yes"
      cancelText="No"
      key="list-vertical-delete-o"
    >
      <a><IconText icon={DeleteTwoTone} text="Delete" /></a>
    </Popconfirm>],
    author: 'Han Solo',
    avatar: 'https://joeschmoe.io/api/v1/random',
    content: (
      <p>
        We supply a series of design principles, practical patterns and high quality design
        resources (Sketch and Axure), to help people create their product prototypes beautifully and
        efficiently.
      </p>
    ),
    datetime: (
      <Tooltip title="2016-11-22 10:22:33">
        <span>9 hours ago</span>
      </Tooltip>
    ),
  },
];

// inline style
const Container = styled.div`
  margin: auto auto;
  padding: 10px 20x;
  background-color: #fff;
  position: relative;
  width: 1100px;
  max-width: 1200px;
`;

const HeartSvg = () => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
    <path d="M923 283.6c-13.4-31.1-32.6-58.9-56.9-82.8-24.3-23.8-52.5-42.4-84-55.5-32.5-13.5-66.9-20.3-102.4-20.3-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5-24.4 23.9-43.5 51.7-56.9 82.8-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3 0.1-35.3-7-69.6-20.9-101.9z" />
  </svg>
);

const HeartIcon = (props) => <Icon component={HeartSvg} {...props} />;

function LikesButton () {
  const token = getToken();

  const [islike, setIslike, recipeId, setLikes] = useContext(C)
  console.log('success' + islike)

  // eslint-disable-next-line prefer-const
  let islikew = islike
  const clickLike = () => {
    const token = getToken();
    if (!token) {
      message.error('You cannot use this function until you log in')
      return
    }
    islikew = true
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/favourite/like/' + recipeId
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
      },
    }).then(res => res.json())
      .then(data => {
        if (data.message) {
          if (data.message.includes('you can\'t like your own recipes')) {
            message.error('You can not like your own recipes');
          } else {
            setTimeout(() => {
              setIslike(true)
              // eslint-disable-next-line prefer-const
              let aurl = 'http://127.0.0.1:5000/recipes/' + recipeId
              fetch(aurl, {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token || getToken()}`,
                },
              }).then(res => res.json())
                .then(data => {
                  if (data.message) {
                    if (data.message.includes('no content this page')) {
                      message.error('no data');
                    }
                  // console.log('recipes list', recipesList);
                  } else {
                    setLikes(data.likes)
                  }
                })
            })
          }
        // console.log('recipes list', recipesList);
        }
      });
  }
  const clickUnlike = () => {
    const token = getToken();
    if (!token) {
      message.error('You cannot use this function until you log in')
      return
    }
    islikew = false
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/favourite/unlike/' + recipeId
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
      },
    }).then(res => res.json())
      .then(data => {
        setIslike(false)
        // eslint-disable-next-line prefer-const
        let aurl = 'http://127.0.0.1:5000/recipes/' + recipeId
        fetch(aurl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token || getToken()}`,
          },
        }).then(res => res.json())
          .then(data => {
            if (data.message) {
              if (data.message.includes('no content this page')) {
                message.error('no data');
              }
            // console.log('recipes list', recipesList);
            } else {
              setLikes(data.likes)
            }
          })
      });
  }
  if (islike === false) {
    return (
      <div style = {{ position: 'absolute', top: 550 }}>
        <HeartOutlined style={{ fontSize: '40px', color: 'hotpink' }} onClick = {clickLike}></HeartOutlined>
      </div>
    )
  } else {
    return (
      <div style = {{ position: 'absolute', top: 550 }}>
        <HeartIcon style={{ fontSize: '40px', color: 'hotpink' }} onClick = {clickUnlike} />
      </div>
    )
  }
}

export default function Recipe () {
  const { recipeId } = useParams()
  const navigate = useNavigate();
  const { saveUser, saveToken } = useUser();
  const { Meta } = Card;
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const [recipesList, setRecipesList] = useState([]);
  const [CommentList, setCommentList] = useState([]);

  const [RecipeName, setRecipeName] = useState('');
  const [MealType, setMealType] = useState('');
  const [MainIngredient, setMainIngredient] = useState('');
  const [IngredientDetail, setIngredientDetail] = useState('');
  const [Time, setTime] = useState('');
  const [Method, setMethod] = useState('');
  const [Description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [HostName, setHostName] = useState('');
  const [HostID, setHostID] = useState('');
  const [img, setImg] = useState('');
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [coments, setComents] = useState('');
  const [HostEmail, setHostEmail] = useState('');
  const [updatetime, setupdatetime] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [introduction, setIntroduction] = useState('');

  const [islike2, setIslike] = useState('');
  // eslint-disable-next-line prefer-const
  // interaction
  let islike = ''
  useEffect(() => {
    const token = getToken();
    // if (!token) return;
    console.log('recipes list', recipesList);
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/recipes/' + recipeId
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
      },
    }).then(res => res.json())
      .then(data => {
        if (data.message) {
          if (data.message.includes('no content this page')) {
            message.error('no data');
          }
        // console.log('recipes list', recipesList);
        } else {
          setRecipesList(data)
          setRecipeName(data.recipe_name)
          setMealType(data.meal_type)
          setMainIngredient(data.main_ingredients)
          setIngredientDetail(data.ingredient_detail)
          setTime(data.time)
          setMethod(data.method)
          setDescription(data.description)
          setAvatar('http://127.0.0.1:5000/' + data.photo)
          setHostName(data.author.username)
          setHostID(data.author.id)
          setImg('http://127.0.0.1:5000/' + data.author.avatar)
          setViews(data.views)
          setLikes(data.likes)
          setComents(data.comments)
          setupdatetime(data.last_modified)
          setHostEmail(data.author.email)
          setIntroduction(data.author.introduction)
        }
      });
    // eslint-disable-next-line prefer-const
    let curl = 'http://127.0.0.1:5000/comment?recipe=' + recipeId + '&page=1&pagesize=100'
    if (!token) {
      message.error('comments only shown after login')
      return
    }
    fetch(curl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
      },
    }).then(res => res.json())
      .then(data => {
        if (data.message) {
          if (data.message.includes('no data')) {
            message.error('no data');
          }
        // console.log('recipes list', recipesList);
        } else {
          setTimeout(() => {
            setCommentList(data.comments)
          })
        }
      });
    // eslint-disable-next-line prefer-const
    let isurl = 'http://127.0.0.1:5000/favourite/recipe/' + recipeId + '/check'
    fetch(isurl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
      },
    }).then(res => res.json())
      .then(data => {
        setTimeout(() => {
          // setIslike(data.message)
          console.log(data)
          islike = data.message
          setIslike(islike)
          console.log('islike ' + islike2)
        })
      });
  }, []);
  console.log('Comment list', CommentList);

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/recommend/' + recipeId
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
          setRecipes(data.recipes)
        }
      });
  }, []);

  const Recipedata = useMemo(() => {
    return recipes.map(recipe => ({
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
  }, [recipes]);

  function DeleteComment (id) {
    request(`/comment/${id}`, {
      method: 'delete',
    }).then((response) => {
      if (response.message) {
        if (response.message.includes('this comment/recipe is not yours')) {
          message.error('You can only delete your comments')
        } else {
          const token = getToken();
          // const token = getToken();
          // response && message.success('Recipe delete success', 0.5, () => {

          setTimeout(() => {
            // eslint-disable-next-line prefer-const
            let curl = 'http://127.0.0.1:5000/comment?recipe=' + recipeId + '&page=1&pagesize=100'
            fetch(curl, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token || getToken()}`,
              },
            }).then(res => res.json())
              .then(data => {
                if (data.message) {
                  if (data.message.includes('no content this page')) {
                    setCommentList([])
                    // eslint-disable-next-line prefer-const
                    let aurl = 'http://127.0.0.1:5000/recipes/' + recipeId
                    fetch(aurl, {
                      method: 'GET',
                      headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token || getToken()}`,
                      },
                    }).then(res => res.json())
                      .then(data => {
                        if (data.message) {
                          if (data.message.includes('no content this page')) {
                            message.error('no data');
                          }
                        // console.log('recipes list', recipesList);
                        } else {
                          setComents(data.comments)
                        }
                      })
                  }
                // console.log('recipes list', recipesList);
                } else {
                  setCommentList(data.comments)
                  // eslint-disable-next-line prefer-const
                  let aurl = 'http://127.0.0.1:5000/recipes/' + recipeId
                  fetch(aurl, {
                    method: 'GET',
                    headers: {
                      Accept: 'application/json',
                      Authorization: `Bearer ${token || getToken()}`,
                    },
                  }).then(res => res.json())
                    .then(data => {
                      if (data.message) {
                        if (data.message.includes('no content this page')) {
                          message.error('no data');
                        }
                      // console.log('recipes list', recipesList);
                      } else {
                        setComents(data.comments)
                      }
                    })
                }
              });
          })
        }
      }
    });
  }

  const Commentlistdata = useMemo(() => {
    return CommentList.map(comment => ({
      ...comment,
      actions: [<Popconfirm
        title="Are you sure to delete this comment?"
        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        onConfirm={() => { DeleteComment(comment.id) }}
        onCancel={() => {}}
        okText="Yes"
        cancelText="No"
        key="list-vertical-delete-o"
      >
        <a><IconText icon={DeleteTwoTone} text="Delete" /></a>
      </Popconfirm>],
      username: comment.comment_author.username,
      comments: comment.content,
      avatar: 'http://127.0.0.1:5000/' + comment.comment_author.avatar,
      timestamp: comment.timestamp
    }));
  }, [CommentList]);

  const handleSubmit = () => {
    const token = getToken();
    if (!token) {
      message.error('you must login')
      return
    }
    if (!value) return;
    // eslint-disable-next-line prefer-const
    let aurl = 'http://127.0.0.1:5000/comment'
    request('/comment', {
      method: 'post',
      data: {
        content: value,
        recipe_id: recipeId
      }
    }).then(data => {
      message.success('comment create');
      setValue('')
      // eslint-disable-next-line prefer-const
      let curl = 'http://127.0.0.1:5000/comment?recipe=' + recipeId + '&page=1&pagesize=100'
      fetch(curl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token || getToken()}`,
        },
      }).then(res => res.json())
        .then(data => {
          if (data.message) {
            if (data.message.includes('no content this page')) {
              message.error('no data');
            }
          // console.log('recipes list', recipesList);
          } else {
            setCommentList(data.comments)
            // eslint-disable-next-line prefer-const
            let aurl = 'http://127.0.0.1:5000/recipes/' + recipeId
            fetch(aurl, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token || getToken()}`,
              },
            }).then(res => res.json())
              .then(data => {
                if (data.message) {
                  if (data.message.includes('no content this page')) {
                    message.error('no data');
                  }
                // console.log('recipes list', recipesList);
                } else {
                  setComents(data.comments)
                }
              })
          }
        });
    });
  };
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const onFinish = (values) => {
    console.log('Success:', values);
    request('/admin/auth/personalInfor', {
      method: 'put',
      data: values
    }).then(data => {
      const userInfor = {
        email: values.email,
        name: values.name,
      }
      saveUser(userInfor);
      saveToken(data.token);
      message.success('success');
      navigate('/');
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <FullScreenContainer4>
    <Container>
    <Row>
      <Col span={5} offset={3}>
      <img src={avatar} alt="" width={'800px'} height={'600px'}/>
      </Col>
      <Col span={2} offset={11}>
      <C.Provider value={[islike2, setIslike, recipeId, setLikes]} >
      <LikesButton key="list-vertical-message" />
    </C.Provider>
      </Col>
    </Row>
    <Divider orientation="left"></Divider>
    <Row>
      <Col span={2} offset={4}>
      <IconText icon={EyeOutlined} text={views} key="list-vertical-message" />
      </Col>
      <Col span={2} offset={5}>
      <IconText icon={HeartOutlined} text={likes} key="list-vertical-like-o" />
      </Col>
      <Col span={2} offset={5}>
      <IconText icon={MessageOutlined} text={coments} key="list-vertical-message" />
      </Col>
    </Row>
    <Divider orientation="left"></Divider>
    <Row>
      <Col span={1} offset={3}>
      <Avatar onClick={() => { location.href = '/OtherPersonalInfor/' + HostID; }} size = {180} src={img} />
      </Col>
      <Col span={14} offset={6}>
      {/* <List.Item>Name: lu</List.Item>
      <List.Item>E-mail: E-mail</List.Item>
      <List.Item>Gender: Man</List.Item> */}
      <Descriptions title="About Author" bordered>
      <Descriptions.Item label="Name" span={1}>{HostName}</Descriptions.Item>
      <Descriptions.Item label="E-mail" span={2}>{HostEmail}</Descriptions.Item>
      <Descriptions.Item label="Introduction" span={2}>{introduction}</Descriptions.Item>
    </Descriptions>
      </Col>
    </Row>
    <Divider orientation="left"></Divider>
    <Descriptions title={RecipeName} bordered>
    <Descriptions.Item label="Update Time" span={1.5}>{updatetime}</Descriptions.Item>
    <Descriptions.Item label="Meal Type" span={1.5}>{MealType}</Descriptions.Item>
    <Descriptions.Item label="Main Ingredient" span={1.5}>{MainIngredient}</Descriptions.Item>
    <Descriptions.Item label="Ingredient Detail" span={1.5}>{IngredientDetail}</Descriptions.Item>
    <Descriptions.Item label="Time" span={1.5}>{Time}</Descriptions.Item>
    <Descriptions.Item label="Method" span={1.5}>{Method}</Descriptions.Item>
    <Descriptions.Item label="Description">{Description}</Descriptions.Item>
    </Descriptions>
    <Divider orientation="left"></Divider>
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
        pageSize: 3,
        style: { textAlign: 'center' },
      }}
      header={<div style={{ fontSize: '15px', fontWeight: 'bold' }} >More delicious ideas for you</div>}
      dataSource={Recipedata}
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
            <h1 style={{ fontSize: '20px' }}>{item.title}</h1>
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
    <List
    className="comment-list"
    header={`${CommentList.length} replies`}
    itemLayout="horizontal"
    dataSource={Commentlistdata}
    pagination={{
      onChange: (page) => {
        console.log(page);
      },
      pageSize: 5,
      style: { textAlign: 'center' },
    }}
    renderItem={item => (
      <li>
        <Comment
          actions={item.actions}
          author={item.username}
          avatar={item.avatar}
          content={item.comments}
          datetime={item.timestamp}
        />
      </li>
    )}
  />
    <>
      {comments.length > 0 && <CommentList comments={comments} />}
      <Comment
        // avatar={<Avatar src={avatar} alt="Han Solo" />}
        content={
          <Editor
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            value={value}
          />
        }
      />
    </>
    </Container>
    </FullScreenContainer4>
  );
}
