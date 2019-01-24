Firstly, please configure environment
```
touch .env
```
copy variable same as .env.example


Install app:
```
npm install -g typescript
npm install
npm start
```

Build in docker-compose
```
chmod +x ./init.sh
./init.sh
```

Enable hot reload typescript in visual code
```
Ctrl+Shift+B
select tsc:watch
npm start
```
