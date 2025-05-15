# Node.js 24の公式イメージをベースとして使用
FROM node:24-bookworm-slim

# 作業ディレクトリを設定
WORKDIR /workspace
# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    && rm -rf /var/lib/apt/lists/*

# グローバルなNode.jsパッケージをインストール
RUN npm install -g \
    npm@latest \
    typescript \
    eslint \
    @google/clasp 
        

USER node

# 開発サーバー起動コマンドを設定
CMD ["bash"]