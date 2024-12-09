#!/bin/bash

BLUE_PORT=8081
GREEN_PORT=8082
CURRENT_PORT=$(sudo iptables -t nat -L PREROUTING -n -v | grep "REDIRECT" | grep "dpt:80" | awk '{print $NF}' | cut -d':' -f2)

cd /home/ubuntu/app

if [ "$CURRENT_PORT" == "$BLUE_PORT" ]; then
  # 현재 Blue가 활성화 -> Green으로 전환
  TARGET_PORT=$GREEN_PORT
  echo "Switching to Green (Port: $TARGET_PORT)..."
  sudo docker-compose -p node_ex-green -f docker-compose.green.yml up -d --build
else
  # 현재 Green이 활성화 -> Blue로 전환
  TARGET_PORT=$BLUE_PORT
  echo "Switching to Blue (Port: $TARGET_PORT)..."
  sudo docker-compose -p node_ex-blue -f docker-compose.blue.yml up -d --build
fi

sleep 30

# iptables 규칙 변경
echo "Updating iptables to redirect traffic to $TARGET_PORT..."
sudo iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-port $CURRENT_PORT
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port $TARGET_PORT

# 기존 컨테이너 종료
if [ "$CURRENT_PORT" == "$BLUE_PORT" ]; then
  echo "Stopping Blue container..."
  sudo docker-compose -p node_ex-blue -f docker-compose.blue.yml down
else
  echo "Stopping Green container..."
  sudo docker-compose -p node_ex-green -f docker-compose.green.yml down
fi

sudo docker image prune -af

echo "Deployment complete. Traffic redirected to $TARGET_PORT."

