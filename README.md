# gas-project

## 開発概要
Google Apps Script（GAS）を効率的にリポジトリ管理し、複数人での開発や案件ごとの分離を容易にするためのプロジェクトです。Node.jsやclasp（Command Line Apps Script Projects）を活用し、ローカル環境にNode.jsを直接インストールせず、DevContainer（VSCodeの開発用コンテナ）を利用して開発環境を構築します。

## なぜこの手法を選択したのか
- **Node.jsのローカルインストール不要**  
  開発者ごとにNode.jsのバージョンや依存関係の違いによるトラブルを防ぐため、DevContainerを利用して環境を統一します。
- **複数人での開発**  
  Gitリポジトリでソース管理することで、複数人での共同開発やレビューが容易になります。
- **案件ごとの分離**  
  案件ごとにリポジトリを分けることで、管理や権限設定がシンプルになります。
- **再現性の高い環境構築**  
  DevContainerを使うことで、誰でも同じ開発環境をすぐに用意できます。

## 開発方法
1. **リポジトリをクローン**  
   ```
   git clone <このリポジトリのURL>
   ```
2. **VSCodeで開く**  
   VSCodeでプロジェクトを開き、コマンドパレットから「Remote-Containers: Reopen in Container」を選択します。
3. **claspのセットアップ**  
   DevContainer内のターミナルで以下を実行し、Googleアカウントでログインします。
   ```
   clasp login
   ```
4. **GASプロジェクトの作成またはクローン**  
   新規作成の場合：
   ```
   clasp create --type standalone --title "プロジェクト名"
   ```
   既存プロジェクトを利用する場合：
   ```
   clasp clone <scriptId>
   ```
5. **開発・push/pull**  
   コードを編集し、`clasp push`でGASに反映、`clasp pull`で最新のGASコードを取得します。

## その後の利用方法
- **デプロイ**  
  GASの管理画面やclaspコマンドでデプロイできます。
- **他の開発者の参加**  
  リポジトリをクローンし、同様にDevContainerで開発環境を構築するだけで参加可能です。
- **バージョン管理**  
  GitHub等でバージョン管理・レビュー・CI/CD連携も可能です。

## 他の管理方法
- **直接GASエディタで管理**  
  ブラウザ上のGASエディタで直接編集する方法。  
  → バージョン管理や複数人開発には不向き。
- **ローカルにNode.jsをインストールしてclaspを利用**  
  DevContainerを使わず、各自のPCにNode.jsとclaspをインストールして管理する方法。  
  → 環境差異によるトラブルが発生しやすい。
- **Google Driveでファイル共有**  
  スクリプトファイルをGoogle Driveで共有する方法。  
  → バージョン管理や共同編集の効率は低い。

---

このリポジトリでは、**DevContainer + clasp + Git**による「再現性・効率・安全性」の高いGAS開発フローを推奨しています。