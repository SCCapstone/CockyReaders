function Vector(inX, inY) {
	this.x = inX;
	this.y = inY;
}

Vector.prototype.add = function(input) {
	
	return new Vector(this.x + input.x, this.y + input.y);
}

Vector.prototype.subtract = function(input) {
	
	return new Vector(this.x - input.x, this.y - input.y);
}