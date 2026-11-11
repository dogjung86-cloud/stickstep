#!/usr/bin/env bash
# 서버 없이 보는 개발용 번들(.u6v5-dev/). 정답 표식(data-ok)과 바로 열기(?open=)가 살아 있다. 배포하지 않는다.
NODE_ENV=development npx vite build --mode development --outDir .u6v5-dev --emptyOutDir --logLevel warn
