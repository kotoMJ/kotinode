#!/usr/bin/env bash
echo ">> use [mongo] command to access database (use: show dbs, use kotinode, ...)"
echo ">> use [mongod] command to start database process"
export NODE_ENV=dev
mongod --dbpath ./extra/mongodb