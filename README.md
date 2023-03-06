## capstone-project-9900-m18q-brainstorm

Project repo for Comp9900 info-tech project.

Team member:

- Hanyue Jiang : Backend & Scrum Master 

- Xueqing Ren : Backend

- Shiyu Nie : Frontend

- Han Yan : Frontend

- Zening Wang : Frontend

For Software Quality assessment, codebase is tested on VLAB

Our system preferred to be run with window size 1920 * 1080 or bigger.  

More detailed User Manual is included in our Report.

If you can't run our system successfully, please contact Hanyue Jiang via z5228748@ad.unsw.edu.au

 

## Build

Recommend Python Version : 3.8.5.  But environment on VLAB should be fine.

## Backend Setup 

### 1 cd "$your_path"/backend 

### 2 create virtual env （for the first time you run）

```shell
$ python3 -m venv venv
```

### 3 enter virtual env

```shell
$ source venv/bin/activate
```

### 4 install packages in requirements

```shell
(venv)$ pip install -r requirements.txt
```

### 5 migrate database

```shell
(venv)$ flask db upgrade
```

### 6 run backend

```shell
(venv)$ flask run
```

## Frontend Setup

make sure your environment have npm

### 1 cd "$your_path"/frontend

### 2 download node modules

```shell
$ npm i
```

### 3 run frontend

```shell
$ npm start
```

## Test Database

When you successfully run backend and frontend above. You can see that we have already put some data in the database. Here's some accounts we have created.

accounts:                              

brainstorm@gmail.com

hanyue@gmail.com

comp9900@gmail.com

1150658609@qq.com

password for all accounts above: Brainstorm9900 

If you want to test without given database. Then cd backend and delete demo.db and set up backend by the steps above again.

## Unittest

Our backend includes unittest and we have already write some tests.

You can follow the following test to check our unittest

## 1 cd "$your_path"/backend 

## 2 enter virtual env

```shell
$ source venv/bin/activate
```

## 3 run unittest

```shell
(venv)$ flask test
```

