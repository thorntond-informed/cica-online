# `CICA Online` Overview
This module acts as the "front end" of the CICA Online web app. This is built to be ran in a containerised environment using Docker.

# `CICA Online` Installation
```bat
:: content of an example installer batch file. 
call cd src/
call npm install
call cd ../

call docker build --no-cache -t cicav2-cica-online .

call cd src/

:: create CICA Online containers.
:: dev.
call docker run -d -p 5000:3000 -p 5858:5858 --restart=always -v %CD%:/usr/src/app --name cicav2--cica-online cicav2-cica-online npm run debug
:: test.
call docker run -d -p 5200:3000 -v %CD%:/usr/src/app --name cicav2--cica-online-test cicav2-cica-online npm test

:: rebuild so that the assets are working as they should be.
:: caused by the fact that the host OS may differ from the OS inside the Docker container.
:: rebuilding it makes sure that it will have all the correct files/configs for the OS it will be running on.
call docker exec -it cicav2--cica-online npm rebuild node-sass
call docker restart cicav2--cica-online
```

# `CICA Online` Uninstallation
```bat
:: content of an example uninstaller batch file. 
call docker stop cicav2--cica-online
call docker rm cicav2--cica-online
call docker stop cicav2--cica-online-test
call docker rm cicav2--cica-online-test
call docker image rm cicav2-cica-online
```

# `CICA Online` Running
```bat
:: content of an example runner batch file. 
call docker restart cicav2--cica-online
call docker logs --since 0m -f cicav2--cica-online
```

Once the container is running, given the configuration above, you should be able to see the web app by navigating to: 

> http://localhost:5000

in your browser.


this is just a test
