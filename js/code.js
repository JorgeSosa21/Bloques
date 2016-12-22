window.onload = function(){

    var game = new Phaser.Game(480, 320, Phaser.AUTO, 'gameContainer', {preload: preload, create: create, update: update});

    var ball;
    var paddle;
    var bricks;
    var newBrick;
    var brickInfo;
    var scoreText;
    var score = 0;
    var lives = 3;
    var livesText;
    var lifeLostText;
    var playing = 0;
    var startButton;

    function preload(){
        game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.backgroundColor = '#ddd';
        game.load.image('paddle', 'img/paddle.png');
        game.load.image('brick', 'img/brick.png');
        game.load.spritesheet('ball', 'img/wobble.png', 20,20);
        game.load.spritesheet('button', 'img/button.png', 120, 40);
		game.load.shader('bacteria', 'assets/bacteria.frag');
		game.load.audio('sfx', 'assets/audio/SoundEffects/fx_mixdown.ogg');
    }

    function create(){
		filter = new Phaser.Filter(game, null, game.cache.getShader('bacteria'));
		filter.addToWorld(0, 0, 800, 600);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.checkCollision.down = false;
        ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
        ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
        ball.anchor.set(0.5);
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.set(1);
        ball.checkWorldBounds = true;
        ball.events.onOutOfBounds.add(ballLeaveScreen, this);
		

        paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
        paddle.anchor.set(0.5, 1);
        game.physics.enable(paddle, Phaser.Physics.ARCADE);
        paddle.body.immovable = true;

        initBricks();

        textSyle = {font: '18px Arial', fill: '#0095DD'};
        scoreText = game.add.text(5,5, 'Points: 0', textSyle);
        livesText = game.add.text(game.world.width-5, 5, 'Vidas: ' + lives, textSyle);
        livesText.anchor.set(1,0);
        lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, click to continue', textSyle);
        lifeLostText.anchor.set(0.5);
        lifeLostText.visible = false;

        startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
        startButton.anchor.set(0.5);
		
		fx = game.add.audio('sfx');
		fx.allowMultiple = true;
		
		fx.addMarker('numkey', 9, 0.1);
		fx.addMarker('shot', 17, 1.0);
		fx.addMarker('death', 12, 4.2);
		
    }

    function update(){
        game.physics.arcade.collide(ball, paddle, ballHitPaddle);
        game.physics.arcade.collide(ball, bricks, ballHitBrick);
        if(playing) {
            paddle.x = game.input.x || game.world.width*0.5;
        }
		filter.update();
    }

    function initBricks(){
        brickInfo = {
            width: 50,
            height: 20,
            count: {
                col: 7,
                row: 3
            },
            offset: {
                top: 50,
                left: 60
            },
            padding: 10
        }

        bricks = game.add.group();

        for(c=0; c<brickInfo.count.col; c++){
            for(r=0; r<brickInfo.count.row; r++){

                var brickX = (c*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
                var brickY = (r*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;

                newBrick = game.add.sprite(brickX, brickY, 'brick');
                game.physics.enable(newBrick, Phaser.Physics.ARCADE);
                newBrick.body.immovable = true;
                newBrick.anchor.set(0.5);
                bricks.add(newBrick);

            }
        }
    }

    function ballHitBrick(ball, brick){

        var killTween = game.add.tween(brick.scale);
        killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
        killTween.onComplete.addOnce(function(){
            brick.kill();
        }, this);
        killTween.start();
		
		fx.play("shot");
		
        score += 10;
        scoreText.setText('Points: ' + score);

        if(score === brickInfo.count.row*brickInfo.count.col*10) {
            alert('You won the game, congratulations!');
            location.reload();
        }
    }

    function ballLeaveScreen() {
		fx.play("death");
        lives--;
        if(lives){
            livesText.setText('Vidas: ' + lives);
            lifeLostText.visible = true;
            ball.reset(game.world.width*0.5, game.world.height-25);
            paddle.reset(game.world.width*0.5, game.world.height-5);
            game.input.onDown.addOnce(function(){
                lifeLostText.visible = false;
                ball.body.velocity.set(150, -150);
            }, this);
        }else{
            alert('You lost, game over');
            location.reload();
        }
    }

    function ballHitPaddle(ball, paddle){
        ball.animations.play('wobble');
		fx.play("numkey");
    }

    function startGame() {
        startButton.destroy();
        ball.body.velocity.set(300, -150);
        playing = 1;
    }

}
