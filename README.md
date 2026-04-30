# Job Application tracker

## after cloning repository:
In BACKEND cread .env file and paste:

`PORT=5000
MONGO_URI=mongodb://jobtracker:kiO80sClSpv9VgUo@ac-ngxhgdt-shard-00-00.shfyhf7.mongodb.net:27017,ac-ngxhgdt-shard-00-01.shfyhf7.mongodb.net:27017,ac-ngxhgdt-shard-00-02.shfyhf7.mongodb.net:27017/jobtracker?ssl=true&replicaSet=atlas-ao2y6l-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=jobtrackersecret123`

In FRONTEND create .env.local and paste:

`NEXT_PUBLIC_API_URL=http://localhost:5000/api`


## To run: 

Open terminal

    1. cd BACKEND

    2. npm install
   
    3. npm run dev

Open a second terminal

    1. cd FRONTEND
   
    2. npm install
   
    3. npm run dev
   
    4. click on and open localhost link. (ex: "http://localhost:3000")


assignment does not need code submitted, only slideshow that has a link to our recorded presentation of the slides + demo of website. So its fine this runs on local 