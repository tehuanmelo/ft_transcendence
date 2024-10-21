from django.contrib.postgres.fields import ArrayField
from django.db import models


class TicTacToeGame(models.Model):

	board = ArrayField(
		ArrayField(
			models.CharField(max_length=10, blank=True),
			size=3,
		),
		size=3,
	)

